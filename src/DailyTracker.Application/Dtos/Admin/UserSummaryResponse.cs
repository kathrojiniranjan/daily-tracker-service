namespace DailyTracker.Application.Dtos.Admin;

/// <summary>
/// Admin-facing summary of a single user. Exposes role *name* (not id) so the
/// client doesn't need to join against a separate roles list.
/// </summary>
public sealed record UserSummaryResponse(
    Guid Id,
    string Username,
    string Email,
    string Role,
    DateTime CreatedAt,
    int TransactionCount);
