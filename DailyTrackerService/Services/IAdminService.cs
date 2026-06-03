using DailyTrackerService.Dtos.Admin;

namespace DailyTrackerService.Services;

public interface IAdminService
{
    Task<AdminSummaryResponse> GetSummaryAsync(int year, int month, CancellationToken ct = default);
}
