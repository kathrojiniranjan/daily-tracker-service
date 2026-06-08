using DailyTracker.Api.Auditing;
using DailyTracker.Application.Dtos.Auth;
using DailyTracker.Application.UseCases;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DailyTracker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    // POST: api/auth/login
    [HttpPost("login")]
    [EnableRateLimiting("login")] // 5 attempts/min/IP (configured in Program.cs)
    [Audit("Login")]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken ct)
    {
        var response = await _auth.LoginAsync(request, ct);
        return Ok(response);
    }

    // POST: api/auth/register
    [HttpPost("register")]
    [EnableRateLimiting("login")] // reuse the strict bucket — slows enumeration attacks
    [Audit("Register")]
    public async Task<ActionResult<LoginResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken ct)
    {
        var response = await _auth.RegisterAsync(request, ct);
        return Ok(response);
    }
}
