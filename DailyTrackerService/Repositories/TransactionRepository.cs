using DailyTrackerService.Data;
using DailyTrackerService.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace DailyTrackerService.Repositories;

public sealed class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _db;

    public TransactionRepository(AppDbContext db) => _db = db;

    public Task<Transaction?> GetByIdAsync(Guid id) =>
        _db.Transactions
           .Include(t => t.DailyItem)
           .FirstOrDefaultAsync(t => t.Id == id);

    public Task<List<Transaction>> GetForUserAsync(Guid userId, DateOnly from, DateOnly to) =>
        _db.Transactions
           .AsNoTracking()
           .Include(t => t.DailyItem)
           .Where(t => t.UserId == userId
                    && t.TransactionDate >= from
                    && t.TransactionDate <= to)
           .OrderByDescending(t => t.TransactionDate)
           .ThenByDescending(t => t.CreatedAt)
           .ToListAsync();

    public Task<List<Transaction>> GetForRangeAsync(Guid? userId, DateOnly from, DateOnly to)
    {
        var q = _db.Transactions
            .AsNoTracking()
            .Include(t => t.DailyItem)
            .Include(t => t.User)
            .Where(t => t.TransactionDate >= from && t.TransactionDate <= to);

        if (userId is Guid uid)
            q = q.Where(t => t.UserId == uid);

        return q.OrderByDescending(t => t.TransactionDate)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();
    }

    public async Task<decimal> GetMonthlyTotalAsync(Guid userId, int year, int month)
    {
        var from = new DateOnly(year, month, 1);
        var to = from.AddMonths(1).AddDays(-1);

        // EF translates Sum on an empty sequence to NULL; coalesce to 0.
        var total = await _db.Transactions
            .Where(t => t.UserId == userId
                     && t.TransactionDate >= from
                     && t.TransactionDate <= to)
            .SumAsync(t => (decimal?)t.Amount);

        return total ?? 0m;
    }

    public async Task AddAsync(Transaction transaction) =>
        await _db.Transactions.AddAsync(transaction);

    public void Remove(Transaction transaction) =>
        _db.Transactions.Remove(transaction);

    public async Task<(int Count, decimal Total)> GetAllStatsAsync(DateOnly from, DateOnly to)
    {
        var query = _db.Transactions
            .Where(t => t.TransactionDate >= from && t.TransactionDate <= to);

        var count = await query.CountAsync();
        var total = await query.SumAsync(t => (decimal?)t.Amount) ?? 0m;
        return (count, total);
    }

    public async Task<List<(string Username, decimal Total)>> GetTopSpendersAsync(
        DateOnly from, DateOnly to, int topN)
    {
        // SQLite cannot ORDER BY decimal — group server-side, then sort/take in memory.
        var grouped = await _db.Transactions
            .Where(t => t.TransactionDate >= from && t.TransactionDate <= to)
            .GroupBy(t => t.User!.Username)
            .Select(g => new { Username = g.Key, Total = g.Sum(t => t.Amount) })
            .ToListAsync();

        return grouped
            .OrderByDescending(x => x.Total)
            .Take(topN)
            .Select(r => (r.Username, r.Total))
            .ToList();
    }
}
