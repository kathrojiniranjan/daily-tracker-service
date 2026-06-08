public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        Console.WriteLine($"Incoming request: {request.Method} {request.Path}");
        _logger.LogInformation("Incoming request: {Method} {Path}", request.Method, request.Path);
        Console.WriteLine($"before next");

        await _next(context);//Calling next middleware in the pipeline
        Console.WriteLine($"after next");
    }
}