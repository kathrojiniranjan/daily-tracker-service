using Asp.Versioning;
using DailyTrackerService.Auditing;
using DailyTrackerService.Dtos.Transactions;
using DailyTrackerService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DailyTrackerService.Controllers.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/transactions")]
[Authorize] // any authenticated user; ownership enforced inside the service
public sealed class TransactionsController : BaseApiController
{
    private readonly ITransactionService _service;

    public TransactionsController(ITransactionService service) => _service = service;

    // GET: api/v1/transactions/{id}
    [HttpGet("{id:guid}", Name = nameof(GetById))]
    public async Task<ActionResult<TransactionResponse>> GetById(Guid id, CancellationToken ct)
    {
        var tx = await _service.GetByIdAsync(CurrentUserId, id, ct);
        return Ok(tx);
    }

    // GET: api/v1/transactions?from=2026-05-01&to=2026-05-31&userId=...
    // Admins see all users (optionally filtered by userId). Regular users see
    // only their own; the userId query param is ignored for them.
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransactionResponse>>> GetRange(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        [FromQuery] Guid? userId,
        CancellationToken ct)
    {
        var list = IsAdmin
            ? await _service.GetForRangeAdminAsync(userId, from, to, ct)
            : await _service.GetForRangeAsync(CurrentUserId, from, to, ct);
        return Ok(list);
    }

    // GET: api/v1/transactions/summary/2026/5
    [HttpGet("summary/{year:int}/{month:int}")]
    public async Task<ActionResult<MonthlySummaryResponse>> GetMonthlySummary(
        int year, int month, CancellationToken ct)
    {
        var summary = await _service.GetMonthlySummaryAsync(CurrentUserId, year, month, ct);
        return Ok(summary);
    }

    // POST: api/v1/transactions
    [HttpPost]
    [Audit("TransactionCreated")]
    public async Task<ActionResult<TransactionResponse>> Create(
        [FromBody] CreateTransactionRequest request,
        CancellationToken ct)
    {
        var tx = await _service.CreateAsync(CurrentUserId, request, ct);
        return CreatedAtRoute(
            nameof(GetById),
            new { id = tx.Id, version = "1.0" },
            tx);
    }

    // PUT: api/v1/transactions/{id}
    [HttpPut("{id:guid}")]
    [Audit("TransactionUpdated")]
    public async Task<ActionResult<TransactionResponse>> Update(
        Guid id,
        [FromBody] UpdateTransactionRequest request,
        CancellationToken ct)
    {
        var tx = await _service.UpdateAsync(CurrentUserId, id, request, ct);
        return Ok(tx);
    }

    // DELETE: api/v1/transactions/{id}
    [HttpDelete("{id:guid}")]
    [Audit("TransactionDeleted")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(CurrentUserId, id, ct);
        return NoContent();
    }
}
