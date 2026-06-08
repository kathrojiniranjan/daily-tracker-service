namespace DailyTracker.Domain.Entities;

/// <summary>
/// An app user. Maps to the Users table.
/// PasswordHash is stored, never the plain password.
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    // FK -> Roles.Id. Use the Role nav property to read the name (e.g. "Admin").
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties (EF uses these for joins; nothing is stored here directly).
    public ICollection<DailyItem> CustomItems { get; set; } = new List<DailyItem>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
