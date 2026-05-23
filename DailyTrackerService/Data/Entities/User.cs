namespace DailyTrackerService.Data.Entities;

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

    // "Admin" or "User" — matches the authorization policies in Program.cs.
    public string Role { get; set; } = "User";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties (EF uses these for joins; nothing is stored here directly).
    public ICollection<DailyItem> CustomItems { get; set; } = new List<DailyItem>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
