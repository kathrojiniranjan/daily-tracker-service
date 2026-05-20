using Asp.Versioning;
using DailyTrackerService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using V1Controller = DailyTrackerService.Controllers.V1.DailyItemsController;

namespace DailyTrackerService.Controllers.V2;

[ApiController]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/dailyitems")]
[Authorize]
public class DailyItemsController : ControllerBase
{
    // v2 difference: GET returns an envelope { count, items } instead of a raw array.
    // GET: api/v2/dailyitems
    [HttpGet]
    public ActionResult<object> GetDailyItems()
        => Ok(new { count = V1Controller.Store.Count, items = V1Controller.Store });

    // GET: api/v2/dailyitems/5
    [HttpGet("{id:int}")]
    public ActionResult<DailyItem> GetDailyItem(int id)
    {
        var item = V1Controller.Store.FirstOrDefault(i => i.Id == id);
        return item is null ? NotFound() : Ok(item);
    }

    // POST: api/v2/dailyitems
    [HttpPost]
    public ActionResult<DailyItem> PostDailyItem([FromBody] DailyItem newItem)
    {
        if (string.IsNullOrWhiteSpace(newItem.Title))
            return BadRequest("Title is required.");

        newItem.Id = V1Controller.NextId();
        V1Controller.Store.Add(newItem);
        return CreatedAtAction(nameof(GetDailyItem), new { id = newItem.Id, version = "2.0" }, newItem);
    }

    // PUT: api/v2/dailyitems/5
    [HttpPut("{id:int}")]
    public IActionResult PutDailyItem(int id, [FromBody] DailyItem updated)
    {
        var existing = V1Controller.Store.FirstOrDefault(i => i.Id == id);
        if (existing is null) return NotFound();

        existing.Title = updated.Title;
        existing.Notes = updated.Notes;
        existing.IsCompleted = updated.IsCompleted;
        existing.Date = updated.Date;
        return NoContent();
    }

    // PATCH: api/v2/dailyitems/5
    [HttpPatch("{id:int}")]
    public ActionResult<DailyItem> PatchDailyItem(int id, [FromBody] DailyItemPatch patch)
    {
        var existing = V1Controller.Store.FirstOrDefault(i => i.Id == id);
        if (existing is null) return NotFound();

        if (patch.Title is not null)    existing.Title = patch.Title;
        if (patch.Notes is not null)    existing.Notes = patch.Notes;
        if (patch.IsCompleted.HasValue) existing.IsCompleted = patch.IsCompleted.Value;
        if (patch.Date.HasValue)        existing.Date = patch.Date.Value;
        return Ok(existing);
    }
}
