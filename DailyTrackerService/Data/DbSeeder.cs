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

        await SeedRolesAsync(db);
        await db.SaveChangesAsync();

        await SeedUsersAsync(db);
        await SeedSystemItemsAsync(db);
        await PromoteLegacyUserItemsAsync(db);

        await db.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(AppDbContext db)
    {
        if (await db.Roles.AnyAsync()) return;

        await db.Roles.AddRangeAsync(
            new Role { Name = "Admin" },
            new Role { Name = "User" });
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
        {
            return; // already seeded
        }

        var adminRoleId = await db.Roles.Where(r => r.Name == "Admin").Select(r => r.Id).FirstAsync();
        var userRoleId  = await db.Roles.Where(r => r.Name == "User").Select(r => r.Id).FirstAsync();

        // PasswordHasher: PBKDF2 + per-user salt + version byte. Built into ASP.NET Core.
        var hasher = new PasswordHasher<User>();

        var admin = new User
        {
            Username = "admin",
            Email = "admin@local",
            RoleId = adminRoleId,
        };
        admin.PasswordHash = hasher.HashPassword(admin, DevPassword);

        var user1 = new User
        {
            Username = "user",
            Email = "user@local",
            RoleId = userRoleId,
        };
        user1.PasswordHash = hasher.HashPassword(user1, DevPassword);

        var user2 = new User
        {
            Username = "user2",
            Email = "user2@local",
            RoleId = userRoleId,
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

    // One-time cleanup: items created before catalog became admin-only may exist
    // as user-owned custom items. Promote those owned by Admin users to system.
    private static async Task PromoteLegacyUserItemsAsync(AppDbContext db)
    {
        var adminIds = await db.Users
            .Where(u => u.Role.Name == "Admin")
            .Select(u => u.Id)
            .ToListAsync();

        if (adminIds.Count == 0) return;

        var legacy = await db.DailyItems
            .Where(i => !i.IsSystem
                     && i.OwnerUserId != null
                     && adminIds.Contains(i.OwnerUserId.Value))
            .ToListAsync();

        foreach (var item in legacy)
        {
            item.IsSystem = true;
            item.OwnerUserId = null;
        }
    }
}
