using Asp.Versioning;
using DailyTrackerService.Auditing;
using DailyTrackerService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyTrackerService.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/dailyitems")]
[Authorize(Policy = "CanReadItems")]
public class DailyItemsController : ControllerBase
{
    // Simple in-memory store for learning. Replace with a DB later.
    private static readonly List<DailyItem> _items = new()
    {
        new DailyItem { Id = 1, Title = "Read a book",   IsCompleted = false, Date = DateOnly.FromDateTime(DateTime.Today) },
        new DailyItem { Id = 2, Title = "Go for a walk", IsCompleted = true,  Date = DateOnly.FromDateTime(DateTime.Today) }
    };
    private static int _nextId = 3;

    // Shared with V2 controller (learning shortcut; replace with a service later).
    internal static List<DailyItem> Store => _items;
    internal static int NextId() => _nextId++;

    // GET: api/v1/dailyitems
    [HttpGet]
    public ActionResult<IEnumerable<DailyItem>> GetDailyItems() => Ok(_items);

    // GET: api/v1/dailyitems/5
    [HttpGet("{id:int}")]
    public ActionResult<DailyItem> GetDailyItem(int id)
    {
        var item = _items.FirstOrDefault(i => i.Id == id);
        return item is null ? NotFound() : Ok(item);
    }

    // POST: api/v1/dailyitems
    [HttpPost]
    [Authorize(Policy = "CanWriteItems")]
    [Audit("ItemCreated")]
    public ActionResult<DailyItem> PostDailyItem([FromBody] DailyItem newItem)
    {
        if (string.IsNullOrWhiteSpace(newItem.Title))
            return BadRequest("Title is required.");

        newItem.Id = _nextId++;
        _items.Add(newItem);
        return CreatedAtAction(nameof(GetDailyItem), new { id = newItem.Id, version = "1.0" }, newItem);
    }

    // PUT: api/v1/dailyitems/5
    [HttpPut("{id:int}")]
    [Authorize(Policy = "CanWriteItems")]
    [Audit("ItemReplaced")]
    public IActionResult PutDailyItem(int id, [FromBody] DailyItem updated)
    {
        var existing = _items.FirstOrDefault(i => i.Id == id);
        if (existing is null) return NotFound();

        existing.Title = updated.Title;
        existing.Notes = updated.Notes;
        existing.IsCompleted = updated.IsCompleted;
        existing.Date = updated.Date;
        return NoContent();
    }

    // PATCH: api/v1/dailyitems/5
    [HttpPatch("{id:int}")]
    [Authorize(Policy = "CanWriteItems")]
    [Audit("ItemPatched")]
    public ActionResult<DailyItem> PatchDailyItem(int id, [FromBody] DailyItemPatch patch)
    {
        var existing = _items.FirstOrDefault(i => i.Id == id);
        if (existing is null) return NotFound();

        if (patch.Title is not null)    existing.Title = patch.Title;
        if (patch.Notes is not null)    existing.Notes = patch.Notes;
        if (patch.IsCompleted.HasValue) existing.IsCompleted = patch.IsCompleted.Value;
        if (patch.Date.HasValue)        existing.Date = patch.Date.Value;
        return Ok(existing);
    }
}
