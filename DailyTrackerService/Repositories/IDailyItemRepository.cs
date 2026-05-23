using DailyTrackerService.Data.Entities;

namespace DailyTrackerService.Repositories;

public interface IDailyItemRepository
{
    /// <summary>
    /// Returns the picker list for a user: every active system item plus
    /// every active custom item owned by that user.
    /// </summary>
    Task<List<DailyItem>> GetVisibleToUserAsync(Guid userId);

    Task<DailyItem?> GetByIdAsync(int id);

    Task AddAsync(DailyItem item);

    void Remove(DailyItem item);
}
