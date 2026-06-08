namespace DailyTracker.Api.Auditing;

/// <summary>
/// Mark a controller action with this to automatically write an audit
/// entry after the action executes. The action name appears in the
/// "Action" field of the audit record.
/// Example: [Audit("ItemCreated")]
/// </summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
public sealed class AuditAttribute : Attribute
{
    public string Action { get; }
    public AuditAttribute(string action) => Action = action;
}
