using DailyTrackerService.Dtos.DailyItems;

namespace DailyTrackerService.Services;

public interface IDailyItemService
{
    /// <summary>System items + the user's own custom items.</summary>
    Task<IReadOnlyList<DailyItemResponse>> GetVisibleAsync(Guid userId, CancellationToken ct = default);

    Task<DailyItemResponse> CreateCustomAsync(Guid userId, CreateDailyItemRequest request, CancellationToken ct = default);

    /// <summary>Soft-delete the user's own custom item. Cannot remove system items.</summary>
    Task DeleteCustomAsync(Guid userId, int itemId, CancellationToken ct = default);
}
