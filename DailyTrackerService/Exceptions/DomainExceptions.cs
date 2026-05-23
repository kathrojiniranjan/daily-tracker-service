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

/// <summary>
/// The caller is authenticated but not permitted to perform this action
/// (e.g. trying to edit another user's transaction). Maps to HTTP 403.
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}

/// <summary>
/// The request would violate a uniqueness or state constraint
/// (e.g. username already taken). Maps to HTTP 409.
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
