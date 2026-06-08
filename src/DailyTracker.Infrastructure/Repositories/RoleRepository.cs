using DailyTracker.Infrastructure.Persistence;
using DailyTracker.Domain.Entities;
using DailyTracker.Application.Contracts;
using Microsoft.EntityFrameworkCore;

namespace DailyTracker.Infrastructure.Repositories;

public sealed class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _db;

    public RoleRepository(AppDbContext db) => _db = db;

    public Task<Role?> GetByNameAsync(string name) =>
        _db.Roles.FirstOrDefaultAsync(r => r.Name == name);
}
