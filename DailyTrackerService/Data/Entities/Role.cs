namespace DailyTrackerService.Data.Entities;

/// <summary>
/// A role assigned to users (e.g. "Admin", "User"). Normalised into its own
/// table so role names live in one place and can be renamed without touching
/// every user row.
/// </summary>
public class Role
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    // Nav: every user that has this role.
    public ICollection<User> Users { get; set; } = new List<User>();
}
