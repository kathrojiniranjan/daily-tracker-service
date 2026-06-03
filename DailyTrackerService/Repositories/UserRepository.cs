using DailyTrackerService.Data;
using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Admin;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> GetByIdAsync(Guid id) =>
        _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByUsernameAsync(string username) =>
        _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == username);

    public Task<bool> UsernameExistsAsync(string username) =>
        _db.Users.AnyAsync(u => u.Username == username);

    public Task<bool> EmailExistsAsync(string email) =>
        _db.Users.AnyAsync(u => u.Email == email);

    public async Task AddAsync(User user) =>
        await _db.Users.AddAsync(user);

    public Task<int> CountAsync() =>
        _db.Users.CountAsync();

    public async Task<IReadOnlyList<UserSummaryResponse>> GetAllSummariesAsync()
    {
        // Project straight into the DTO so EF only SELECTs the columns we need.
        // u.Transactions.Count() becomes a correlated sub-query in SQL.
        var rows = await _db.Users
            .OrderBy(u => u.Username)
            .Select(u => new UserSummaryResponse(
                u.Id,
                u.Username,
                u.Email,
                u.Role.Name,
                u.CreatedAt,
                u.Transactions.Count()))
            .ToListAsync();

        return rows;
    }
}
