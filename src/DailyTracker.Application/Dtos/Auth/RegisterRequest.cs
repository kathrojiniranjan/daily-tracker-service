using System.ComponentModel.DataAnnotations;

namespace DailyTracker.Application.Dtos.Auth;

public sealed record RegisterRequest
{
    [Required]
    [StringLength(64, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9_.-]+$",
        ErrorMessage = "Username may contain letters, digits, dot, underscore, hyphen.")]
    public string Username { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string Password { get; init; } = string.Empty;
}
