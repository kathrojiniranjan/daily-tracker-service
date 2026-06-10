using DailyTracker.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DailyTracker.Infrastructure.Persistence;

/// <summary>
/// Idempotent database seeder. Safe to invoke on every application startup.
/// </summary>
public static class DbSeeder
{
    private const string DevPassword = "Password123!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // No migrations exist yet in the layered project, so create the schema
        // directly for local development.
        await db.Database.EnsureCreatedAsync();

        await SeedRolesAsync(db);
        await db.SaveChangesAsync();

        await SeedUsersAsync(db);
        await SeedSystemItemsAsync(db);
        await PromoteLegacyUserItemsAsync(db);

        await db.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(AppDbContext db)
    {
        if (await db.Roles.AnyAsync())
        {
            return;
        }

        await db.Roles.AddRangeAsync(
            new Role { Name = "Admin" },
            new Role { Name = "User" }
        );
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var adminRoleId = await db.Roles
            .Where(role => role.Name == "Admin")
            .Select(role => role.Id)
            .FirstAsync();
        var userRoleId = await db.Roles
            .Where(role => role.Name == "User")
            .Select(role => role.Id)
            .FirstAsync();

        var hasher = new PasswordHasher<User>();

        var admin = new User
        {
            Username = "admin",
            Email = "admin@local",
            RoleId = adminRoleId,
        };
        admin.PasswordHash = hasher.HashPassword(admin, DevPassword);

        var user = new User
        {
            Username = "user",
            Email = "user@local",
            RoleId = userRoleId,
        };
        user.PasswordHash = hasher.HashPassword(user, DevPassword);

        var user2 = new User
        {
            Username = "user2",
            Email = "user2@local",
            RoleId = userRoleId,
        };
        user2.PasswordHash = hasher.HashPassword(user2, DevPassword);

        await db.Users.AddRangeAsync(admin, user, user2);
    }

    private static async Task SeedSystemItemsAsync(AppDbContext db)
    {
        if (await db.DailyItems.AnyAsync(item => item.IsSystem))
        {
            return;
        }

        var items = new[]
        {
            new DailyItem { Name = "Milk", Unit = "L", DefaultPrice = 60m, IsSystem = true },
            new DailyItem { Name = "Bread", Unit = "pcs", DefaultPrice = 30m, IsSystem = true },
            new DailyItem { Name = "Petrol", Unit = "L", DefaultPrice = 105m, IsSystem = true },
            new DailyItem { Name = "Eggs", Unit = "pcs", DefaultPrice = 7m, IsSystem = true },
            new DailyItem { Name = "Vegetables", Unit = "kg", DefaultPrice = 50m, IsSystem = true },
        };

        await db.DailyItems.AddRangeAsync(items);
    }

    private static async Task PromoteLegacyUserItemsAsync(AppDbContext db)
    {
        var adminIds = await db.Users
            .Where(user => user.Role.Name == "Admin")
            .Select(user => user.Id)
            .ToListAsync();

        if (adminIds.Count == 0)
        {
            return;
        }

        var legacyItems = await db.DailyItems
            .Where(item => !item.IsSystem
                && item.OwnerUserId != null
                && adminIds.Contains(item.OwnerUserId.Value))
            .ToListAsync();

        foreach (var item in legacyItems)
        {
            item.IsSystem = true;
            item.OwnerUserId = null;
        }
    }
}
