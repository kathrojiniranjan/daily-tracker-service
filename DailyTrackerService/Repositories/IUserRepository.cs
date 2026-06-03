using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Admin;

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
    /// Admin-only listing: projects each user plus a count of their transactions.
    /// Returned as a DTO (not entities) because we don't want to materialise full
    /// User objects just to read a few columns.
    /// </summary>
    Task<IReadOnlyList<UserSummaryResponse>> GetAllSummariesAsync();
}
