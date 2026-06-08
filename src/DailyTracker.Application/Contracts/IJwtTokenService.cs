using DailyTracker.Domain.Entities;

namespace DailyTracker.Application.Contracts;

public interface IJwtTokenService
{
    string CreateToken(User user, string role);
}
