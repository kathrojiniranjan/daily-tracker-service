using DailyTracker.Application.Contracts;
using DailyTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyTracker.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options), IAppDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<DailyItem> DailyItems => Set<DailyItem>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(e =>
        {
            e.Property(r => r.Name).HasMaxLength(32).IsRequired();
            e.HasIndex(r => r.Name).IsUnique();
        });

        modelBuilder.Entity<User>(e =>
        {
            e.Property(u => u.Username).HasMaxLength(64).IsRequired();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(512).IsRequired();
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Role)
             .WithMany(r => r.Users)
             .HasForeignKey(u => u.RoleId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DailyItem>(e =>
        {
            e.Property(i => i.Name).HasMaxLength(128).IsRequired();
            e.Property(i => i.Unit).HasMaxLength(16);
            e.Property(i => i.DefaultPrice).HasPrecision(10, 2);
            e.HasIndex(i => i.Name);
            e.HasOne(i => i.Owner)
             .WithMany(u => u.CustomItems)
             .HasForeignKey(i => i.OwnerUserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Transaction>(e =>
        {
            e.Property(t => t.Quantity).HasPrecision(10, 3);
            e.Property(t => t.Amount).HasPrecision(10, 2);
            e.Property(t => t.Notes).HasMaxLength(500);
            e.HasIndex(t => new { t.UserId, t.TransactionDate });
            e.HasOne(t => t.User)
             .WithMany(u => u.Transactions)
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.DailyItem)
             .WithMany(i => i.Transactions)
             .HasForeignKey(t => t.DailyItemId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
