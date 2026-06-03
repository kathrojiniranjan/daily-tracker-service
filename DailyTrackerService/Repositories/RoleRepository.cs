using DailyTrackerService.Data;
using DailyTrackerService.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Repositories;

public sealed class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _db;

    public RoleRepository(AppDbContext db) => _db = db;

    public Task<Role?> GetByNameAsync(string name) =>
        _db.Roles.FirstOrDefaultAsync(r => r.Name == name);
}
