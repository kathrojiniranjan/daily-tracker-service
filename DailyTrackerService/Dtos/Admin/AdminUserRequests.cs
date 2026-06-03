using System.ComponentModel.DataAnnotations;

namespace DailyTrackerService.Dtos.Admin;

public sealed record AssignRoleRequest(
    [Required, StringLength(32, MinimumLength = 1)] string Role);

public sealed record ChangePasswordRequest(
    [Required, StringLength(100, MinimumLength = 8)] string NewPassword);
