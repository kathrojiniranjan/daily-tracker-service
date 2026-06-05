using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Admin;
using DailyTrackerService.Dtos.Common;

namespace DailyTrackerService.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> UsernameExistsAsync(string username);
    Task<bool> EmailExistsAsync(string email);
    Task AddAsync(User user);
    Task<int> CountAsync();

    /// <summary>
    /// Admin-only paged listing: projects each user plus a count of their
    /// transactions. Returns the page slice plus total count for the caller
    /// to compute pagination metadata.
    /// </summary>
    Task<PagedResult<UserSummaryResponse>> GetSummariesPagedAsync(PageQuery query);
}
