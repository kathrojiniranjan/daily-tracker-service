using Microsoft.EntityFrameworkCore.Storage;

namespace DailyTrackerService.Repositories;

/// <summary>
/// Coordinates the commit of changes staged across one or more repositories.
/// Backed by a single AppDbContext per HTTP request, so all repos in a
/// request share the same change tracker and the same implicit transaction
/// when SaveChangesAsync is called.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Persist every Added / Modified / Deleted entity in the current
    /// DbContext as one SQL transaction. Returns the number of rows affected.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Start an explicit transaction. Use only when a single SaveChanges call
    /// is not sufficient (e.g. multiple SaveChanges that must roll back
    /// together, or coordination with external resources).
    /// </summary>
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}
