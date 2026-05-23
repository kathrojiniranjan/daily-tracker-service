using DailyTrackerService.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Data;

/// <summary>
/// The EF Core DbContext — one session per HTTP request (registered as Scoped).
/// Holds DbSet&lt;T&gt; collections (one per table) and configures the relational model.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // One DbSet = one table. Names become table names by convention.
    public DbSet<User> Users => Set<User>();
    public DbSet<DailyItem> DailyItems => Set<DailyItem>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── Users ────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.Property(u => u.Username).HasMaxLength(64).IsRequired();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(512).IsRequired();
            e.Property(u => u.Role).HasMaxLength(32).IsRequired();

            // Unique + indexed -> no duplicates, fast lookup at login.
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ─── DailyItems (catalog) ─────────────────────────────────────────────
        modelBuilder.Entity<DailyItem>(e =>
        {
            e.Property(i => i.Name).HasMaxLength(128).IsRequired();
            e.Property(i => i.Unit).HasMaxLength(16);
            e.Property(i => i.DefaultPrice).HasPrecision(10, 2);

            // Picker queries filter/sort by name.
            e.HasIndex(i => i.Name);

            // Owner is optional (null for system items).
            // If a user is deleted, their custom items lose the owner link
            // but are kept (SetNull). Change to Cascade if you want to delete them too.
            e.HasOne(i => i.Owner)
             .WithMany(u => u.CustomItems)
             .HasForeignKey(i => i.OwnerUserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ─── Transactions ─────────────────────────────────────────────────────
        modelBuilder.Entity<Transaction>(e =>
        {
            e.Property(t => t.Quantity).HasPrecision(10, 3);  // 2.500 L
            e.Property(t => t.Amount).HasPrecision(10, 2);    // ₹999999.99 max
            e.Property(t => t.Notes).HasMaxLength(500);

            // Monthly-view query: WHERE UserId = ? AND TransactionDate BETWEEN ? AND ?
            // A composite index in this order serves it directly.
            e.HasIndex(t => new { t.UserId, t.TransactionDate });

            // Don't allow deleting a user who has transactions.
            e.HasOne(t => t.User)
             .WithMany(u => u.Transactions)
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            // Don't allow hard-deleting a catalog item that's been used in a transaction.
            // (We soft-delete via DailyItem.IsActive instead.)
            e.HasOne(t => t.DailyItem)
             .WithMany(i => i.Transactions)
             .HasForeignKey(t => t.DailyItemId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
