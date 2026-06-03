using DailyTrackerService.Data;
using DailyTrackerService.Data.Entities;
using DailyTrackerService.Dtos.Admin;
using DailyTrackerService.Exceptions;
using DailyTrackerService.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Services;

public sealed class AdminService : IAdminService
{
    private const int TopSpendersCount = 5;
    private const string AdminRoleName = "Admin";

    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly ITransactionRepository _transactions;
    private readonly AppDbContext _db;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher<User> _hasher;

    public AdminService(
        IUserRepository users,
        IRoleRepository roles,
        ITransactionRepository transactions,
        AppDbContext db,
        IUnitOfWork uow,
        IPasswordHasher<User> hasher)
    {
        _users = users;
        _roles = roles;
        _transactions = transactions;
        _db = db;
        _uow = uow;
        _hasher = hasher;
    }

    public async Task<AdminSummaryResponse> GetSummaryAsync(
        int year, int month, CancellationToken ct = default)
    {
        if (month is < 1 or > 12)
            throw new ValidationException("Month must be between 1 and 12.");

        var from = new DateOnly(year, month, 1);
        var to = from.AddMonths(1).AddDays(-1);

        var totalUsers = await _users.CountAsync();
        var (count, total) = await _transactions.GetAllStatsAsync(from, to);
        var spenders = await _transactions.GetTopSpendersAsync(from, to, TopSpendersCount);

        var topSpenders = spenders
            .Select(s => new TopSpenderResponse(s.Username, s.Total))
            .ToList();

        return new AdminSummaryResponse(totalUsers, count, total, topSpenders);
    }

    public Task<IReadOnlyList<UserSummaryResponse>> GetUsersAsync(CancellationToken ct = default) =>
        _users.GetAllSummariesAsync();

    public async Task AssignRoleAsync(
        Guid actingAdminId, Guid userId, string roleName, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found.");

        var role = await _roles.GetByNameAsync(roleName)
            ?? throw new ValidationException($"Role '{roleName}' does not exist.");

        // No-op if already in this role.
        if (user.RoleId == role.Id) return;

        // Lockout guard: don't let an admin demote themselves if they're the
        // only admin left — the system needs at least one admin.
        if (user.Id == actingAdminId
            && user.Role.Name == AdminRoleName
            && role.Name != AdminRoleName)
        {
            var adminCount = await CountAdminsAsync();
            if (adminCount <= 1)
                throw new ConflictException("Cannot demote the last admin.");
        }

        user.RoleId = role.Id;
        await _uow.SaveChangesAsync(ct);
    }

    public async Task ChangePasswordAsync(
        Guid userId, string newPassword, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found.");

        user.PasswordHash = _hasher.HashPassword(user, newPassword);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task DeleteUserAsync(
        Guid actingAdminId, Guid userId, CancellationToken ct = default)
    {
        if (actingAdminId == userId)
            throw new ConflictException("You cannot delete your own account.");

        var user = await _users.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found.");

        // Lockout guard: never delete the last admin.
        if (user.Role.Name == AdminRoleName)
        {
            var adminCount = await CountAdminsAsync();
            if (adminCount <= 1)
                throw new ConflictException("Cannot delete the last admin.");
        }

        // Transaction->User FK is Restrict, so remove their transactions first.
        // (Custom items will be nulled out by SetNull cascade.)
        var theirTransactions = await _db.Transactions
            .Where(t => t.UserId == userId)
            .ToListAsync(ct);
        _db.Transactions.RemoveRange(theirTransactions);

        _db.Users.Remove(user);
        await _uow.SaveChangesAsync(ct);
    }

    private Task<int> CountAdminsAsync() =>
        _db.Users.CountAsync(u => u.Role.Name == AdminRoleName);
}
