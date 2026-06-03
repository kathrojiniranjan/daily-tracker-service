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

    // POST: api/v1/dailyitems  — admin-only. Creates a system item visible to all users.
    [HttpPost]
    [Authorize(Policy = "CanWriteItems")]
    [Audit("DailyItemCreated")]
    public async Task<ActionResult<DailyItemResponse>> Create(
        [FromBody] CreateDailyItemRequest request,
        CancellationToken ct)
    {
        var item = await _service.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, item);
    }

    // PUT: api/v1/dailyitems/5  — admin-only. Update name / unit / default price.
    [HttpPut("{id:int}")]
    [Authorize(Policy = "CanWriteItems")]
    [Audit("DailyItemUpdated")]
    public async Task<ActionResult<DailyItemResponse>> Update(
        int id,
        [FromBody] UpdateDailyItemRequest request,
        CancellationToken ct)
    {
        var item = await _service.UpdateAsync(id, request, ct);
        return Ok(item);
    }

    // DELETE: api/v1/dailyitems/5  — admin-only. Soft-deletes a system item.
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "CanDeleteItems")]
    [Audit("DailyItemDeleted")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
