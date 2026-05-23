namespace DailyTrackerService.Dtos.Auth;

public sealed record LoginResponse(
    string AccessToken,
    DateTime ExpiresAtUtc,
    string Username,
    string Role);
