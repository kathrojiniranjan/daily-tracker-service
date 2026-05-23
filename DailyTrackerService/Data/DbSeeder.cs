using DailyTrackerService.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Data;

/// <summary>
/// Idempotent database seeder. Safe to invoke on every application startup —
/// each block guards with an existence check before inserting.
/// </summary>
public static class DbSeeder
{
    // Shared dev password. NEVER do this in production seed data.
    private const string DevPassword = "Password123!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        // Create a DI scope manually because DbContext is scoped and we are
        // running outside of an HTTP request (startup).
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Make sure the DB schema is in sync. In production you usually run
        // `dotnet ef database update` as a deploy step instead of this call,
        // but for a learning project this is convenient.
        await db.Database.MigrateAsync();

        await SeedUsersAsync(db);
        await SeedSystemItemsAsync(db);

        await db.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
        {
            return; // already seeded
        }

        // PasswordHasher: PBKDF2 + per-user salt + version byte. Built into ASP.NET Core.
        var hasher = new PasswordHasher<User>();

        var admin = new User
        {
            Username = "admin",
            Email = "admin@local",
            Role = "Admin",
        };
        admin.PasswordHash = hasher.HashPassword(admin, DevPassword);

        var user1 = new User
        {
            Username = "user",
            Email = "user@local",
            Role = "User",
        };
        user1.PasswordHash = hasher.HashPassword(user1, DevPassword);

        var user2 = new User
        {
            Username = "user2",
            Email = "user2@local",
            Role = "User",
        };
        user2.PasswordHash = hasher.HashPassword(user2, DevPassword);

        await db.Users.AddRangeAsync(admin, user1, user2);
    }

    private static async Task SeedSystemItemsAsync(AppDbContext db)
    {
        if (await db.DailyItems.AnyAsync(i => i.IsSystem))
        {
            return; // system items already present
        }

        var items = new[]
        {
            new DailyItem { Name = "Milk",       Unit = "L",   DefaultPrice = 60m,  IsSystem = true },
            new DailyItem { Name = "Bread",      Unit = "pcs", DefaultPrice = 30m,  IsSystem = true },
            new DailyItem { Name = "Petrol",     Unit = "L",   DefaultPrice = 105m, IsSystem = true },
            new DailyItem { Name = "Eggs",       Unit = "pcs", DefaultPrice = 7m,   IsSystem = true },
            new DailyItem { Name = "Vegetables", Unit = "kg",  DefaultPrice = 50m,  IsSystem = true },
        };

        await db.DailyItems.AddRangeAsync(items);
    }
}
