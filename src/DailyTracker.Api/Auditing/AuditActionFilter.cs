using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace DailyTracker.Api.Auditing;

/// <summary>
/// Runs after every action; if the action carries an [Audit("...")] attribute
/// it captures who/what/when/where and writes a record via IAuditLogger.
/// Registered globally in Program.cs.
/// </summary>
public sealed class AuditActionFilter : IAsyncActionFilter
{
    private readonly IAuditLogger _audit;

    public AuditActionFilter(IAuditLogger audit) => _audit = audit;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var attr = context.ActionDescriptor.EndpointMetadata.OfType<AuditAttribute>().FirstOrDefault();
        var executed = await next();           // run the action

        if (attr is null) return;              // nothing to audit

        var http = context.HttpContext;
        var user = http.User;
        var status = executed.Result switch
        {
            IStatusCodeActionResult s => s.StatusCode,
            _ => http.Response.StatusCode
        };

        var entry = new AuditEntry
        {
            TraceId    = http.TraceIdentifier,
            Action     = attr.Action,
            UserName   = user.Identity?.IsAuthenticated == true ? user.Identity.Name : null,
            UserRole   = user.FindFirst(ClaimTypes.Role)?.Value,
            IpAddress  = http.Connection.RemoteIpAddress?.ToString(),
            HttpMethod = http.Request.Method,
            Path       = http.Request.Path,
            StatusCode = status,
            ResourceId = context.RouteData.Values.TryGetValue("id", out var id) ? id?.ToString() : null,
            Outcome    = executed.Exception is null && status is >= 200 and < 400 ? "Success" : "Failure"
        };

        await _audit.LogAsync(entry, http.RequestAborted);
    }
}
