using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Auth;
using DailyTrackerService.Exceptions;
using DailyTrackerService.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace DailyTrackerService.Services;

public sealed class AuthService : IAuthService
{
    private const int TokenLifetimeHours = 1;

    private readonly IUserRepository _users;
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;
    private readonly IPasswordHasher<User> _hasher;

    public AuthService(
        IUserRepository users,
        IUnitOfWork uow,
        IConfiguration config,
        IPasswordHasher<User> hasher)
    {
        _users = users;
        _uow = uow;
        _config = config;
        _hasher = hasher;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByUsernameAsync(request.Username);
        if (user is null)
            throw new ValidationException("Invalid username or password.");

        var verification = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
            throw new ValidationException("Invalid username or password.");

        // If the stored hash uses an older format, upgrade it on the fly.
        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _hasher.HashPassword(user, request.Password);
            await _uow.SaveChangesAsync(ct);
        }

        return BuildLoginResponse(user);
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await _users.UsernameExistsAsync(request.Username))
            throw new ConflictException("Username is already taken.");

        if (await _users.EmailExistsAsync(request.Email))
            throw new ConflictException("Email is already registered.");

        var user = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Role = "User", // self-registration never grants Admin
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        await _users.AddAsync(user);
        await _uow.SaveChangesAsync(ct);

        return BuildLoginResponse(user);
    }

    private LoginResponse BuildLoginResponse(User user)
    {
        var jwt = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwt["Key"]
                ?? throw new InvalidOperationException("Jwt:Key is not configured.")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddHours(TokenLifetimeHours);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        return new LoginResponse(accessToken, expires, user.Username, user.Role);
    }
}
