using DailyTracker.Domain.Entities;

namespace DailyTracker.Application.Contracts;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(string name);
}
