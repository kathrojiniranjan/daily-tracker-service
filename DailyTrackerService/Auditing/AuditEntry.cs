namespace DailyTrackerService.Auditing;

/// <summary>
/// One immutable audit record. Stored append-only.
/// </summary>
public sealed record AuditEntry
{
    public DateTimeOffset Timestamp { get; init; } = DateTimeOffset.UtcNow;
    public string TraceId      { get; init; } = "";
    public string Action       { get; init; } = "";   // e.g. "ItemCreated", "Login"
    public string? UserName    { get; init; }
    public string? UserRole    { get; init; }
    public string? IpAddress   { get; init; }
    public string? HttpMethod  { get; init; }
    public string? Path        { get; init; }
    public int?    StatusCode  { get; init; }
    public string? ResourceId  { get; init; }          // e.g. "5" for /items/5
    public string  Outcome     { get; init; } = "Success"; // Success / Failure
    public Dictionary<string, object?> Data { get; init; } = new(); // arbitrary extras
}
