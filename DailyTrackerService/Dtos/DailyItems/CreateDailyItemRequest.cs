using System.ComponentModel.DataAnnotations;

namespace DailyTrackerService.Dtos.DailyItems;

public sealed record CreateDailyItemRequest
{
    [Required]
    [StringLength(128, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [StringLength(32)]
    public string? Unit { get; init; }

    [Range(0, 1_000_000)]
    public decimal? DefaultPrice { get; init; }
}
