using DailyTracker.Application.Dtos.Common;
using DailyTracker.Application.Dtos.Transactions;

namespace DailyTracker.Application.UseCases;

public interface ITransactionService
{
    Task<TransactionResponse> GetByIdAsync(Guid userId, Guid transactionId, CancellationToken ct = default);

    Task<IReadOnlyList<TransactionResponse>> GetForRangeAsync(
        Guid userId, DateOnly from, DateOnly to, CancellationToken ct = default);

    /// <summary>
    /// Admin variant: returns transactions across all users (or one user when
    /// <paramref name="userIdFilter"/> is set). Includes Username on each row.
    /// </summary>
    Task<IReadOnlyList<TransactionResponse>> GetForRangeAdminAsync(
        Guid? userIdFilter, DateOnly from, DateOnly to, CancellationToken ct = default);

    /// <summary>
    /// Paged variant. When <paramref name="isAdmin"/> is false the call is
    /// scoped to <paramref name="callerId"/>; when true it returns all rows
    /// (or filtered to <paramref name="userIdFilter"/> if set).
    /// </summary>
    Task<PagedResult<TransactionResponse>> GetForRangePagedAsync(
        Guid callerId, bool isAdmin, Guid? userIdFilter,
        DateOnly from, DateOnly to, PageQuery query, CancellationToken ct = default);

    Task<MonthlySummaryResponse> GetMonthlySummaryAsync(
        Guid userId, int year, int month, CancellationToken ct = default);

    Task<TransactionResponse> CreateAsync(
        Guid userId, CreateTransactionRequest request, CancellationToken ct = default);

    Task<TransactionResponse> UpdateAsync(
        Guid userId, Guid transactionId, UpdateTransactionRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid userId, Guid transactionId, CancellationToken ct = default);
}
