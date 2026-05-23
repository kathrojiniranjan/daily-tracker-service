using DailyTrackerService.Data;
using DailyTrackerService.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> GetByIdAsync(Guid id) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByUsernameAsync(string username) =>
        _db.Users.FirstOrDefaultAsync(u => u.Username == username);

    public Task<bool> UsernameExistsAsync(string username) =>
        _db.Users.AnyAsync(u => u.Username == username);

    public Task<bool> EmailExistsAsync(string email) =>
        _db.Users.AnyAsync(u => u.Email == email);

    public async Task AddAsync(User user) =>
        await _db.Users.AddAsync(user);
}
