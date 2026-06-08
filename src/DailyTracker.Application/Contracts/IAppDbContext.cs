using DailyTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyTracker.Application.Contracts;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<DailyItem> DailyItems { get; }
    DbSet<Transaction> Transactions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
