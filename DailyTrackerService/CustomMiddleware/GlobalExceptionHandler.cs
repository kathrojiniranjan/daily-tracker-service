using DailyTrackerService.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace DailyTrackerService.CustomMiddleware;

/// <summary>
/// Catches any unhandled exception and returns an RFC 7807 ProblemDetails response.
/// Registered via builder.Services.AddExceptionHandler&lt;GlobalExceptionHandler&gt;()
/// and activated by app.UseExceptionHandler().
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Log with the full exception (stack trace stays on the server).
        _logger.LogError(
            exception,
            "Unhandled exception on {Method} {Path}",
            httpContext.Request.Method,
            httpContext.Request.Path);

        var (status, title) = exception switch
        {
            NotFoundException        => (StatusCodes.Status404NotFound,        "Resource not found"),
            ValidationException      => (StatusCodes.Status400BadRequest,      "Validation failed"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            ArgumentException        => (StatusCodes.Status400BadRequest,      "Bad request"),
            _                        => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        var problem = new ProblemDetails
        {
            Status   = status,
            Title    = title,
            Detail   = exception.Message,
            Instance = httpContext.Request.Path,
            Type     = $"https://httpstatuses.io/{status}"
        };

        // Helpful in dev only — never leak stack traces in production.
        if (_env.IsDevelopment())
        {
            problem.Extensions["exceptionType"] = exception.GetType().Name;
            problem.Extensions["stackTrace"]    = exception.StackTrace;
        }

        // Correlation id (uses ASP.NET's TraceIdentifier; replace with your own if you use one).
        problem.Extensions["traceId"] = httpContext.TraceIdentifier;

        httpContext.Response.StatusCode  = status;
        httpContext.Response.ContentType = "application/problem+json";
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true; // we handled it — pipeline stops
    }
}
