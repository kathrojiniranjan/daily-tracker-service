using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DailyTrackerService.Auditing;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

namespace DailyTrackerService.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config) => _config = config;

    public record LoginRequest(string Username, string Password);

    // POST: api/auth/login
    [HttpPost("login")]
    [EnableRateLimiting("login")]   // 5 attempts / minute / IP
    [Audit("Login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Demo only — hardcoded user. Replace with real user lookup later.
        if (request.Username != "admin" || request.Password != "password")
            return Unauthorized("Invalid username or password.");

        var jwt = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, request.Username),
            new Claim(ClaimTypes.Name, request.Username),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return Ok(new
        {
            access_token = new JwtSecurityTokenHandler().WriteToken(token),
            expires_in = 3600
        });
    }
}
