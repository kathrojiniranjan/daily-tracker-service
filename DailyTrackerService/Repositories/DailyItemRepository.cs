using DailyTrackerService.Data;
using DailyTrackerService.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Repositories;

public sealed class DailyItemRepository : IDailyItemRepository
{
    private readonly AppDbContext _db;

    public DailyItemRepository(AppDbContext db) => _db = db;

    public Task<List<DailyItem>> GetVisibleToUserAsync(Guid userId) =>
        _db.DailyItems
           .AsNoTracking()
           .Where(i => i.IsActive && (i.IsSystem || i.OwnerUserId == userId))
           .OrderBy(i => i.IsSystem ? 0 : 1) // system first
           .ThenBy(i => i.Name)
           .ToListAsync();

    public Task<DailyItem?> GetByIdAsync(int id) =>
        _db.DailyItems.FirstOrDefaultAsync(i => i.Id == id);

    public async Task AddAsync(DailyItem item) =>
        await _db.DailyItems.AddAsync(item);

    public void Remove(DailyItem item) =>
        _db.DailyItems.Remove(item);
}
