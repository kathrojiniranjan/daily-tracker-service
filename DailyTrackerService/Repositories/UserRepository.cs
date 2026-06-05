using DailyTrackerService.Data;
using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Admin;
using DailyTrackerService.Dtos.Common;
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

    public async Task<PagedResult<UserSummaryResponse>> GetSummariesPagedAsync(PageQuery query)
    {
        var totalCount = await _db.Users.CountAsync();

        var rows = await _db.Users
            .OrderBy(u => u.Username)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .Select(u => new UserSummaryResponse(
                u.Id,
                u.Username,
                u.Email,
                u.Role.Name,
                u.CreatedAt,
                u.Transactions.Count()))
            .ToListAsync();

        return new PagedResult<UserSummaryResponse>(
            rows, totalCount, query.NormalizedPage, query.NormalizedPageSize);
    }
}
