using DailyTrackerService.Dtos.Transactions;

namespace DailyTrackerService.Services;

public interface ITransactionService
{
    Task<TransactionResponse> GetByIdAsync(Guid userId, Guid transactionId, CancellationToken ct = default);

    Task<IReadOnlyList<TransactionResponse>> GetForRangeAsync(
        Guid userId, DateOnly from, DateOnly to, CancellationToken ct = default);

    Task<MonthlySummaryResponse> GetMonthlySummaryAsync(
        Guid userId, int year, int month, CancellationToken ct = default);

    Task<TransactionResponse> CreateAsync(
        Guid userId, CreateTransactionRequest request, CancellationToken ct = default);

    Task<TransactionResponse> UpdateAsync(
        Guid userId, Guid transactionId, UpdateTransactionRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid userId, Guid transactionId, CancellationToken ct = default);
}
