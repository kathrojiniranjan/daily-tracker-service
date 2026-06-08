namespace DailyTracker.Domain.Abstractions;

public interface IDomainEvent
{
    DateTime OccurredAtUtc { get; }
}
