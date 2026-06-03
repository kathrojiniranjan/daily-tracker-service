using DailyTrackerService.Data.Entities;

namespace DailyTrackerService.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(string name);
}
