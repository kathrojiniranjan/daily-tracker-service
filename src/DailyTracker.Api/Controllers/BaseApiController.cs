using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace DailyTracker.Api.Controllers;

/// <summary>
/// Shared base for authenticated API controllers. Centralises the "who is the
/// current user?" lookup so we never sprinkle claim parsing across endpoints.
/// </summary>
[ApiController]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// The authenticated user's id (from the JWT NameIdentifier claim).
    /// Throws if the request is unauthenticated — callers should mark
    /// endpoints with [Authorize] so this is impossible to hit anonymously.
    /// </summary>
    protected Guid CurrentUserId
    {
        get
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("Missing user id claim.");
            return Guid.Parse(raw);
        }
    }

    protected bool IsAdmin => User.IsInRole("Admin");
}
