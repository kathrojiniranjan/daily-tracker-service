using DailyTracker.Infrastructure.Persistence;
using DailyTracker.Domain.Entities;
using DailyTracker.Application.Contracts;
using DailyTracker.Application.Dtos.Common;
using Microsoft.EntityFrameworkCore;

namespace DailyTracker.Infrastructure.Repositories;

public sealed class DailyItemRepository : IDailyItemRepository
{
    private readonly AppDbContext _db;

    public DailyItemRepository(AppDbContext db) => _db = db;

    public Task<List<DailyItem>> GetVisibleToUserAsync(Guid userId) =>
        BaseQuery(userId).ToListAsync();

    public async Task<(List<DailyItem> Items, int TotalCount)> GetVisibleToUserPagedAsync(
        Guid userId, PageQuery query)
    {
        var q = BaseQuery(userId);
        var total = await q.CountAsync();
        var items = await q.Skip(query.Skip).Take(query.NormalizedPageSize).ToListAsync();
        return (items, total);
    }

    public Task<DailyItem?> GetByIdAsync(int id) =>
        _db.DailyItems.FirstOrDefaultAsync(i => i.Id == id);

    public async Task AddAsync(DailyItem item) =>
        await _db.DailyItems.AddAsync(item);

    public void Remove(DailyItem item) =>
        _db.DailyItems.Remove(item);

    private IQueryable<DailyItem> BaseQuery(Guid userId) =>
        _db.DailyItems
           .AsNoTracking()
           .Where(i => i.IsActive && (i.IsSystem || i.OwnerUserId == userId))
           .OrderBy(i => i.IsSystem ? 0 : 1)
           .ThenBy(i => i.Name);
}
