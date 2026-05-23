using DailyTrackerService.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace DailyTrackerService.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _db;

    public UnitOfWork(AppDbContext db) => _db = db;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _db.SaveChangesAsync(cancellationToken);

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default) =>
        _db.Database.BeginTransactionAsync(cancellationToken);
}
