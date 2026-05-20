using DailyTrackerService.Models;
using Microsoft.AspNetCore.Mvc;

namespace DailyTrackerService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DailyItemsController : ControllerBase
{
    // Simple in-memory store for learning. Replace with a DB later.
    private static readonly List<DailyItem> _items = new()
    {
        new DailyItem { Id = 1, Title = "Read a book",   IsCompleted = false, Date = DateOnly.FromDateTime(DateTime.Today) },
        new DailyItem { Id = 2, Title = "Go for a walk", IsCompleted = true,  Date = DateOnly.FromDateTime(DateTime.Today) }
    };
    private static int _nextId = 3;

    // GET: api/dailyitems
    [HttpGet]
    public ActionResult<IEnumerable<DailyItem>> GetDailyItems() => Ok(_items);

    // GET: api/dailyitems/5
    [HttpGet("{id:int}")]
    public ActionResult<DailyItem> GetDailyItem(int id)
    {
        var item = _items.FirstOrDefault(i => i.Id == id);
        return item is null ? NotFound() : Ok(item);
    }

    // POST: api/dailyitems
    [HttpPost]
    public ActionResult<DailyItem> PostDailyItem([FromBody] DailyItem newItem)
    {
        if (string.IsNullOrWhiteSpace(newItem.Title))
            return BadRequest("Title is required.");

        newItem.Id = _nextId++;
        _items.Add(newItem);
        return CreatedAtAction(nameof(GetDailyItem), new { id = newItem.Id }, newItem);
    }

    // PUT: api/dailyitems/5  -> full replace
    [HttpPut("{id:int}")]
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

    // PATCH: api/dailyitems/5  -> partial update
    [HttpPatch("{id:int}")]
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
