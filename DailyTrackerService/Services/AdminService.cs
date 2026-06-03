using DailyTrackerService.Dtos.Admin;
using DailyTrackerService.Exceptions;
using DailyTrackerService.Repositories;

namespace DailyTrackerService.Services;

public sealed class AdminService : IAdminService
{
    private const int TopSpendersCount = 5;

    private readonly IUserRepository _users;
    private readonly ITransactionRepository _transactions;

    public AdminService(IUserRepository users, ITransactionRepository transactions)
    {
        _users = users;
        _transactions = transactions;
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
}
