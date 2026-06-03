using DailyTrackerService.Dtos.Admin;

namespace DailyTrackerService.Services;

public interface IAdminService
{
    Task<AdminSummaryResponse> GetSummaryAsync(int year, int month, CancellationToken ct = default);

    Task<IReadOnlyList<UserSummaryResponse>> GetUsersAsync(CancellationToken ct = default);

    Task AssignRoleAsync(Guid actingAdminId, Guid userId, string roleName, CancellationToken ct = default);

    Task ChangePasswordAsync(Guid userId, string newPassword, CancellationToken ct = default);

    Task DeleteUserAsync(Guid actingAdminId, Guid userId, CancellationToken ct = default);
}
