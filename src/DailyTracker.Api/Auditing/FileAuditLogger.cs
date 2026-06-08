using System.Text.Json;

namespace DailyTracker.Api.Auditing;

/// <summary>
/// Writes audit entries as JSON Lines (.jsonl) — one record per line —
/// to a daily-rotated file under <c>logs/</c>. Append-only so the file
/// is grep-able and tamper-evident.
/// Replace with a DB / Seq / Elasticsearch sink in production.
/// </summary>
public sealed class FileAuditLogger : IAuditLogger, IDisposable
{
    private readonly string _logDirectory;
    private readonly ILogger<FileAuditLogger> _logger;
    private readonly SemaphoreSlim _gate = new(1, 1);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public FileAuditLogger(IHostEnvironment env, ILogger<FileAuditLogger> logger)
    {
        _logDirectory = Path.Combine(env.ContentRootPath, "logs");
        Directory.CreateDirectory(_logDirectory);
        _logger = logger;
    }

    public async Task LogAsync(AuditEntry entry, CancellationToken cancellationToken = default)
    {
        var file = Path.Combine(_logDirectory, $"audit-{DateTime.UtcNow:yyyy-MM-dd}.jsonl");
        var line = JsonSerializer.Serialize(entry, JsonOptions) + Environment.NewLine;

        await _gate.WaitAsync(cancellationToken);
        try
        {
            await File.AppendAllTextAsync(file, line, cancellationToken);
        }
        catch (Exception ex)
        {
            // Auditing must never crash the request — log and move on.
            _logger.LogError(ex, "Failed to write audit entry for action {Action}", entry.Action);
        }
        finally
        {
            _gate.Release();
        }
    }

    public void Dispose() => _gate.Dispose();
}
