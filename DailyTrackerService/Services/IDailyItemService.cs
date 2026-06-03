using DailyTrackerService.Dtos.DailyItems;

namespace DailyTrackerService.Services;

public interface IDailyItemService
{
    /// <summary>All active system items (the shared catalog).</summary>
    Task<IReadOnlyList<DailyItemResponse>> GetVisibleAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Admin-only: create a new system item visible to every user.</summary>
    Task<DailyItemResponse> CreateAsync(CreateDailyItemRequest request, CancellationToken ct = default);

    /// <summary>Admin-only: update name / unit / default price for an item.</summary>
    Task<DailyItemResponse> UpdateAsync(int itemId, UpdateDailyItemRequest request, CancellationToken ct = default);

    /// <summary>Admin-only: soft-delete a system item.</summary>
    Task DeleteAsync(int itemId, CancellationToken ct = default);
}
