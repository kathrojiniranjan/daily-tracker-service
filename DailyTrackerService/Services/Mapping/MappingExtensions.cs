using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.DailyItems;
using DailyTrackerService.Dtos.Transactions;

namespace DailyTrackerService.Services.Mapping;

/// <summary>
/// Hand-written entity-to-DTO converters. Kept here so service code reads
/// linearly: do work on entity, then call .ToResponse() at the boundary.
/// </summary>
internal static class MappingExtensions
{
    public static DailyItemResponse ToResponse(this DailyItem item) =>
        new(item.Id, item.Name, item.Unit, item.DefaultPrice, item.IsSystem);

    public static TransactionResponse ToResponse(this Transaction t) =>
        new(
            t.Id,
            t.UserId,
            // User is only Include()d on admin queries; null for per-user fetches.
            t.User?.Username,
            t.DailyItemId,
            // DailyItem is expected to be Include()d by the repo before mapping.
            t.DailyItem?.Name ?? string.Empty,
            t.DailyItem?.Unit,
            t.Quantity,
            t.Amount,
            t.TransactionDate,
            t.Notes,
            t.CreatedAt);
}
