using DailyTracker.Domain.Entities;
using DailyTracker.Application.Dtos.Common;

namespace DailyTracker.Application.Contracts;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id);

    /// <summary>
    /// Returns the user's transactions in an inclusive date range, eagerly
    /// loading the related DailyItem so callers can render name / unit.
    /// </summary>
    Task<List<Transaction>> GetForUserAsync(Guid userId, DateOnly from, DateOnly to);

    /// <summary>
    /// Admin-only: returns transactions across all users in a date range, or
    /// for a single user when <paramref name="userId"/> is provided. Includes
    /// User so callers can render the owner column.
    /// </summary>
    Task<List<Transaction>> GetForRangeAsync(Guid? userId, DateOnly from, DateOnly to);

    /// <summary>
    /// Paged variant of <see cref="GetForRangeAsync"/>. When <paramref name="includeUser"/>
    /// is true (admin path), eagerly loads the owner so the response can include username.
    /// </summary>
    Task<(List<Transaction> Items, int TotalCount)> GetForRangePagedAsync(
        Guid? userId, DateOnly from, DateOnly to, PageQuery query, bool includeUser);

    /// <summary>
    /// Sums Amount for a user across a calendar month. Returns 0 if none.
    /// </summary>
    Task<decimal> GetMonthlyTotalAsync(Guid userId, int year, int month);

    Task AddAsync(Transaction transaction);

    void Remove(Transaction transaction);

    /// <summary>
    /// Aggregates across all users in a date range. Admin-only callers.
    /// </summary>
    Task<(int Count, decimal Total)> GetAllStatsAsync(DateOnly from, DateOnly to);

    /// <summary>
    /// Top N users by total spend in a date range. Returns username + total.
    /// </summary>
    Task<List<(string Username, decimal Total)>> GetTopSpendersAsync(
        DateOnly from, DateOnly to, int topN);
}
