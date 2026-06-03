using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.DailyItems;
using DailyTrackerService.Exceptions;
using DailyTrackerService.Repositories;
using DailyTrackerService.Services.Mapping;

namespace DailyTrackerService.Services;

public sealed class DailyItemService : IDailyItemService
{
    private readonly IDailyItemRepository _items;
    private readonly IUnitOfWork _uow;

    public DailyItemService(IDailyItemRepository items, IUnitOfWork uow)
    {
        _items = items;
        _uow = uow;
    }

    public async Task<IReadOnlyList<DailyItemResponse>> GetVisibleAsync(
        Guid userId, CancellationToken ct = default)
    {
        var entities = await _items.GetVisibleToUserAsync(userId);
        return entities.Select(i => i.ToResponse()).ToList();
    }

    public async Task<DailyItemResponse> CreateAsync(
        CreateDailyItemRequest request, CancellationToken ct = default)
    {
        var item = new DailyItem
        {
            Name = request.Name.Trim(),
            Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit.Trim(),
            DefaultPrice = request.DefaultPrice,
            IsSystem = true,
            OwnerUserId = null,
            IsActive = true,
        };

        await _items.AddAsync(item);
        await _uow.SaveChangesAsync(ct);
        return item.ToResponse();
    }

    public async Task DeleteAsync(int itemId, CancellationToken ct = default)
    {
        var item = await _items.GetByIdAsync(itemId)
            ?? throw new NotFoundException($"DailyItem {itemId} not found.");

        // Soft delete — preserves any existing transactions that reference it.
        item.IsActive = false;
        await _uow.SaveChangesAsync(ct);
    }

    public async Task<DailyItemResponse> UpdateAsync(
        int itemId, UpdateDailyItemRequest request, CancellationToken ct = default)
    {
        var item = await _items.GetByIdAsync(itemId)
            ?? throw new NotFoundException($"DailyItem {itemId} not found.");

        item.Name = request.Name.Trim();
        item.Unit = string.IsNullOrWhiteSpace(request.Unit) ? null : request.Unit.Trim();
        item.DefaultPrice = request.DefaultPrice;

        await _uow.SaveChangesAsync(ct);
        return item.ToResponse();
    }
}
