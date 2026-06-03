using Asp.Versioning;
using DailyTrackerService.Dtos.Admin;
using DailyTrackerService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyTrackerService.Controllers.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController : BaseApiController
{
    private readonly IAdminService _service;

    public AdminController(IAdminService service) => _service = service;

    // GET: api/v1/admin/summary/2026/6
    [HttpGet("summary/{year:int}/{month:int}")]
    public async Task<ActionResult<AdminSummaryResponse>> GetSummary(
        int year, int month, CancellationToken ct)
    {
        var summary = await _service.GetSummaryAsync(year, month, ct);
        return Ok(summary);
    }

    // GET: api/v1/admin/users
    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<UserSummaryResponse>>> GetUsers(
        CancellationToken ct)
    {
        var users = await _service.GetUsersAsync(ct);
        return Ok(users);
    }

    // PUT: api/v1/admin/users/{id}/role
    [HttpPut("users/{id:guid}/role")]
    public async Task<IActionResult> AssignRole(
        Guid id, [FromBody] AssignRoleRequest request, CancellationToken ct)
    {
        await _service.AssignRoleAsync(CurrentUserId, id, request.Role, ct);
        return NoContent();
    }

    // PUT: api/v1/admin/users/{id}/password
    [HttpPut("users/{id:guid}/password")]
    public async Task<IActionResult> ChangePassword(
        Guid id, [FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        await _service.ChangePasswordAsync(id, request.NewPassword, ct);
        return NoContent();
    }

    // DELETE: api/v1/admin/users/{id}
    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        await _service.DeleteUserAsync(CurrentUserId, id, ct);
        return NoContent();
    }
}
