using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DailyTracker.Domain.Entities;
using DailyTracker.Application.Dtos.Auth;
using DailyTracker.Application.Exceptions;
using DailyTracker.Application.Contracts;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DailyTracker.Application.UseCases;

public sealed class AuthService : IAuthService
{
    private const int TokenLifetimeHours = 1;
    private const string DefaultRoleName = "User";

    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;
    private readonly IPasswordHasher<User> _hasher;

    public AuthService(
        IUserRepository users,
        IRoleRepository roles,
        IUnitOfWork uow,
        IConfiguration config,
        IPasswordHasher<User> hasher)
    {
        _users = users;
        _roles = roles;
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

        var defaultRole = await _roles.GetByNameAsync(DefaultRoleName)
            ?? throw new InvalidOperationException(
                $"Required role '{DefaultRoleName}' is missing. Run the seeder.");

        var user = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            RoleId = defaultRole.Id, // self-registration never grants Admin
            Role = defaultRole,      // attach so BuildLoginResponse can read Name without reload
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        await _users.AddAsync(user);
        await _uow.SaveChangesAsync(ct);

        return BuildLoginResponse(user);
    }

    private LoginResponse BuildLoginResponse(User user)
    {
        var jwt = _config.GetSection("Jwt");
        var keyText = jwt["Key"] ?? "development-test-key-change-me-32-bytes-min";
        if (Encoding.UTF8.GetByteCount(keyText) < 32)
        {
            keyText = keyText.PadRight(32, (char)48);
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyText));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddHours(TokenLifetimeHours);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.Name),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"] ?? "DailyTracker",
            audience: jwt["Audience"] ?? "DailyTrackerClient",
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        return new LoginResponse(accessToken, expires, user.Username, user.Role.Name);
    }
}
