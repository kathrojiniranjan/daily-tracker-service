namespace DailyTrackerService.Dtos.Admin;

public sealed record TopSpenderResponse(string Username, decimal Total);

public sealed record AdminSummaryResponse(
    int TotalUsers,
    int TotalTransactionsThisMonth,
    decimal TotalAmountThisMonth,
    IReadOnlyList<TopSpenderResponse> TopSpenders);
