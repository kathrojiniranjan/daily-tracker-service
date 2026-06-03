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
}
