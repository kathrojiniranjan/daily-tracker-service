using DailyTrackerService.Dtos.Auth;

namespace DailyTrackerService.Services;

public interface IAuthService
{
    /// <summary>
    /// Verifies the username + password, returns a signed JWT + metadata.
    /// Throws <see cref="DailyTrackerService.Exceptions.ValidationException"/>
    /// on bad credentials (mapped to 400 — we deliberately don't expose 401
    /// to avoid revealing which field was wrong).
    /// </summary>
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);

    /// <summary>
    /// Creates a new user with the User role. Throws ConflictException if the
    /// username or email is already taken.
    /// </summary>
    Task<LoginResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
}
