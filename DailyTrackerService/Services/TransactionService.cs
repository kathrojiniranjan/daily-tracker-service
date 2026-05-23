using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Transactions;
using DailyTrackerService.Exceptions;
using DailyTrackerService.Repositories;
using DailyTrackerService.Services.Mapping;

namespace DailyTrackerService.Services;

public sealed class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactions;
    private readonly IDailyItemRepository _items;
    private readonly IUnitOfWork _uow;

    public TransactionService(
        ITransactionRepository transactions,
        IDailyItemRepository items,
        IUnitOfWork uow)
    {
        _transactions = transactions;
        _items = items;
        _uow = uow;
    }

    public async Task<TransactionResponse> GetByIdAsync(
        Guid userId, Guid transactionId, CancellationToken ct = default)
    {
        var tx = await _transactions.GetByIdAsync(transactionId)
            ?? throw new NotFoundException($"Transaction {transactionId} not found.");

        EnsureOwner(tx, userId);
        return tx.ToResponse();
    }

    public async Task<IReadOnlyList<TransactionResponse>> GetForRangeAsync(
        Guid userId, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        if (from > to)
            throw new ValidationException("'from' date must be on or before 'to' date.");

        var rows = await _transactions.GetForUserAsync(userId, from, to);
        return rows.Select(t => t.ToResponse()).ToList();
    }

    public async Task<MonthlySummaryResponse> GetMonthlySummaryAsync(
        Guid userId, int year, int month, CancellationToken ct = default)
    {
        if (month is < 1 or > 12)
            throw new ValidationException("Month must be between 1 and 12.");

        var from = new DateOnly(year, month, 1);
        var to = from.AddMonths(1).AddDays(-1);

        // One round-trip for total, one for count. Could be combined; kept clear.
        var total = await _transactions.GetMonthlyTotalAsync(userId, year, month);
        var rows = await _transactions.GetForUserAsync(userId, from, to);

        return new MonthlySummaryResponse(year, month, total, rows.Count);
    }

    public async Task<TransactionResponse> CreateAsync(
        Guid userId, CreateTransactionRequest request, CancellationToken ct = default)
    {
        // Verify the referenced DailyItem exists AND is visible to this user.
        var item = await _items.GetByIdAsync(request.DailyItemId)
            ?? throw new NotFoundException($"DailyItem {request.DailyItemId} not found.");

        if (!item.IsActive)
            throw new ValidationException("This item is no longer available.");

        // System items are visible to everyone; custom items only to their owner.
        if (!item.IsSystem && item.OwnerUserId != userId)
            throw new ForbiddenException("You cannot use another user's custom item.");

        var tx = new Transaction
        {
            UserId = userId,
            DailyItemId = item.Id,
            Quantity = request.Quantity,
            Amount = request.Amount,
            TransactionDate = request.TransactionDate,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
        };

        await _transactions.AddAsync(tx);
        await _uow.SaveChangesAsync(ct);

        // Attach for mapping (we didn't reload after save).
        tx.DailyItem = item;
        return tx.ToResponse();
    }

    public async Task<TransactionResponse> UpdateAsync(
        Guid userId, Guid transactionId, UpdateTransactionRequest request, CancellationToken ct = default)
    {
        var tx = await _transactions.GetByIdAsync(transactionId)
            ?? throw new NotFoundException($"Transaction {transactionId} not found.");

        EnsureOwner(tx, userId);

        tx.Quantity = request.Quantity;
        tx.Amount = request.Amount;
        tx.TransactionDate = request.TransactionDate;
        tx.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        tx.UpdatedAt = DateTime.UtcNow;

        await _uow.SaveChangesAsync(ct);
        return tx.ToResponse();
    }

    public async Task DeleteAsync(Guid userId, Guid transactionId, CancellationToken ct = default)
    {
        var tx = await _transactions.GetByIdAsync(transactionId)
            ?? throw new NotFoundException($"Transaction {transactionId} not found.");

        EnsureOwner(tx, userId);

        _transactions.Remove(tx);
        await _uow.SaveChangesAsync(ct);
    }

    private static void EnsureOwner(Transaction tx, Guid userId)
    {
        if (tx.UserId != userId)
            throw new ForbiddenException("You can only access your own transactions.");
    }
}
