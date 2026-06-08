using DailyTracker.Application.Dtos.Admin;
using DailyTracker.Application.Dtos.Common;

namespace DailyTracker.Application.UseCases;

public interface IAdminService
{
    Task<AdminSummaryResponse> GetSummaryAsync(int year, int month, CancellationToken ct = default);

    Task<PagedResult<UserSummaryResponse>> GetUsersAsync(PageQuery query, CancellationToken ct = default);

    Task AssignRoleAsync(Guid actingAdminId, Guid userId, string roleName, CancellationToken ct = default);

    Task ChangePasswordAsync(Guid userId, string newPassword, CancellationToken ct = default);

    Task DeleteUserAsync(Guid actingAdminId, Guid userId, CancellationToken ct = default);
}
