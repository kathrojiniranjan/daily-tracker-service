namespace DailyTracker.Application.Dtos.Transactions;

public sealed record MonthlySummaryResponse(
    int Year,
    int Month,
    decimal Total,
    int TransactionCount);
