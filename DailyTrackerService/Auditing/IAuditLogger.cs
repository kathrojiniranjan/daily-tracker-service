namespace DailyTrackerService.Auditing;

/// <summary>
/// Abstraction for persisting audit records. Inject this anywhere
/// you want to record a security/business-significant action.
/// Swap the implementation (file → DB → SIEM) without touching callers.
/// </summary>
public interface IAuditLogger
{
    Task LogAsync(AuditEntry entry, CancellationToken cancellationToken = default);
}
