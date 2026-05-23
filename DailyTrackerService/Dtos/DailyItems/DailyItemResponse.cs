namespace DailyTrackerService.Dtos.DailyItems;

public sealed record DailyItemResponse(
    int Id,
    string Name,
    string? Unit,
    decimal? DefaultPrice,
    bool IsSystem);
