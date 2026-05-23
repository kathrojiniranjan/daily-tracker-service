using Asp.Versioning;
using DailyTrackerService.Auditing;
using DailyTrackerService.Dtos.DailyItems;
using DailyTrackerService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyTrackerService.Controllers.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/dailyitems")]
[Authorize(Policy = "CanReadItems")]
public sealed class DailyItemsController : BaseApiController
{
    private readonly IDailyItemService _service;

    public DailyItemsController(IDailyItemService service) => _service = service;

    // GET: api/v1/dailyitems
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DailyItemResponse>>> GetVisible(CancellationToken ct)
    {
        var items = await _service.GetVisibleAsync(CurrentUserId, ct);
        return Ok(items);
    }

    // POST: api/v1/dailyitems  — creates a custom item owned by the current user.
    // Note: this is NOT [Authorize(Policy = "CanWriteItems")] (admin-only) —
    // any authenticated user can add their own items. Admin-only policies guard
    // operations that mutate shared/system data.
    [HttpPost]
    [Audit("CustomItemCreated")]
    public async Task<ActionResult<DailyItemResponse>> Create(
        [FromBody] CreateDailyItemRequest request,
        CancellationToken ct)
    {
        var item = await _service.CreateCustomAsync(CurrentUserId, request, ct);
        // No GetById endpoint yet — return 201 with the resource and no Location.
        return StatusCode(StatusCodes.Status201Created, item);
    }

    // DELETE: api/v1/dailyitems/5  — soft-delete the user's own custom item.
    [HttpDelete("{id:int}")]
    [Audit("CustomItemDeleted")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _service.DeleteCustomAsync(CurrentUserId, id, ct);
        return NoContent();
    }
}
