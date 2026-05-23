using System.ComponentModel.DataAnnotations;

namespace DailyTrackerService.Dtos.Auth;

public sealed record LoginRequest
{
    [Required]
    [StringLength(64, MinimumLength = 3)]
    public string Username { get; init; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 6)]
    public string Password { get; init; } = string.Empty;
}
