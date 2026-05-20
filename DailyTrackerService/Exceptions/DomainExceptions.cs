namespace DailyTrackerService.Exceptions;

/// <summary>Resource not found — maps to HTTP 404.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

/// <summary>Validation/business-rule failure — maps to HTTP 400.</summary>
public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}
