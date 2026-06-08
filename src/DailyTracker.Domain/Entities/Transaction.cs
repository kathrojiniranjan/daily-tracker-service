namespace DailyTracker.Domain.Entities;

/// <summary>
/// A single purchase/event recorded by a user — e.g. "bought 2L of milk on 12 May for ₹120".
/// References the catalog (DailyItem) and the owner (User).
/// </summary>
public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // FK -> Users.Id (the owner). Indexed (configured in AppDbContext).
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // FK -> DailyItems.Id (the catalog entry).
    public int DailyItemId { get; set; }
    public DailyItem DailyItem { get; set; } = null!;

    // 2.5 L milk, 1.25 kg sugar — decimals supported.
    public decimal Quantity { get; set; }

    // Total paid (INR). Stored as decimal(10,2).
    public decimal Amount { get; set; }

    // Date of purchase as the user reports it (may differ from CreatedAt).
    public DateOnly TransactionDate { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
