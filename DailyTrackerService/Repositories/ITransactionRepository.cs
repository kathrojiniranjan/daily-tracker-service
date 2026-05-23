using DailyTrackerService.Data.Entities;

namespace DailyTrackerService.Repositories;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id);

    /// <summary>
    /// Returns the user's transactions in an inclusive date range, eagerly
    /// loading the related DailyItem so callers can render name / unit.
    /// </summary>
    Task<List<Transaction>> GetForUserAsync(Guid userId, DateOnly from, DateOnly to);

    /// <summary>
    /// Sums Amount for a user across a calendar month. Returns 0 if none.
    /// </summary>
    Task<decimal> GetMonthlyTotalAsync(Guid userId, int year, int month);

    Task AddAsync(Transaction transaction);

    void Remove(Transaction transaction);
}
