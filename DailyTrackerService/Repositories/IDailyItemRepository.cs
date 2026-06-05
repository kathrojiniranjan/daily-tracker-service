using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Common;

namespace DailyTrackerService.Repositories;

public interface IDailyItemRepository
{
    /// <summary>
    /// Returns the picker list for a user: every active system item plus
    /// every active custom item owned by that user.
    /// </summary>
    Task<List<DailyItem>> GetVisibleToUserAsync(Guid userId);

    /// <summary>Paged variant of <see cref="GetVisibleToUserAsync"/>.</summary>
    Task<(List<DailyItem> Items, int TotalCount)> GetVisibleToUserPagedAsync(
        Guid userId, PageQuery query);

    Task<DailyItem?> GetByIdAsync(int id);

    Task AddAsync(DailyItem item);

    void Remove(DailyItem item);
}
