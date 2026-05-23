namespace DailyTrackerService.Data.Entities;

/// <summary>
/// A catalog entry the user can pick when recording a transaction (e.g. "Milk", "Petrol").
/// IsSystem = true  -> seeded by us, visible to everyone (OwnerUserId is null).
/// IsSystem = false -> created by a specific user (OwnerUserId set).
/// Soft-delete via IsActive so deleting an item doesn't break old transactions.
/// </summary>
public class DailyItem
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    // Display unit, e.g. "L", "kg", "pcs". Optional in the picker.
    public string? Unit { get; set; }

    // Pre-fills the amount field in the UI; users can still override.
    public decimal? DefaultPrice { get; set; }

    public bool IsSystem { get; set; }

    // Null for system items; set for user-defined items.
    public Guid? OwnerUserId { get; set; }
    public User? Owner { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Nav: every transaction that references this catalog item.
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
