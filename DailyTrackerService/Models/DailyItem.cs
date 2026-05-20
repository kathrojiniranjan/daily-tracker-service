namespace DailyTrackerService.Models;

public class DailyItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool IsCompleted { get; set; }
    public DateOnly Date { get; set; }
}

// DTO used for PATCH (partial update). All fields are optional/nullable.
public class DailyItemPatch
{
    public string? Title { get; set; }
    public string? Notes { get; set; }
    public bool? IsCompleted { get; set; }
    public DateOnly? Date { get; set; }
}
