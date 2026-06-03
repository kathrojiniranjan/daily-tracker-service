namespace DailyTrackerService.Dtos.Transactions;

public sealed record TransactionResponse(
    Guid Id,
    Guid UserId,
    string? Username,
    int DailyItemId,
    string DailyItemName,
    string? DailyItemUnit,
    decimal Quantity,
    decimal Amount,
    DateOnly TransactionDate,
    string? Notes,
    DateTime CreatedAt);
