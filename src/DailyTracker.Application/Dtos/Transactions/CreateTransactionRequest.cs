using System.ComponentModel.DataAnnotations;

namespace DailyTracker.Application.Dtos.Transactions;

public sealed record CreateTransactionRequest
{
    [Required]
    public int DailyItemId { get; init; }

    [Range(0.001, 1_000_000)]
    public decimal Quantity { get; init; }

    [Range(0, 10_000_000)]
    public decimal Amount { get; init; }

    [Required]
    public DateOnly TransactionDate { get; init; }

    [StringLength(500)]
    public string? Notes { get; init; }
}
