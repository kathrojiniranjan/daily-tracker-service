namespace DailyTracker.Application.Dtos.Common;

/// <summary>
/// Standard envelope for paginated list endpoints.
/// </summary>
public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize)
{
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}

/// <summary>
/// Common query parameters for paginated endpoints. Defaults and clamping live
/// here so every controller doesn't reinvent the same guard rails.
/// </summary>
public sealed record PageQuery
{
    private const int DefaultPageSize = 500;
    private const int MaxPageSize = 1000;

    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = DefaultPageSize;

    public int NormalizedPage => Page < 1 ? 1 : Page;
    public int NormalizedPageSize => PageSize switch
    {
        < 1 => DefaultPageSize,
        > MaxPageSize => MaxPageSize,
        _ => PageSize,
    };
    public int Skip => (NormalizedPage - 1) * NormalizedPageSize;
}
