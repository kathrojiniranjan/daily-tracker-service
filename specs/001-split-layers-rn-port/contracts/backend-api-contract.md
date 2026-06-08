# Backend API Contract (Parity Baseline)

This contract defines externally visible API behavior that must remain compatible during backend layering migration.

## Base Rules

- Existing base URLs and versions are preserved:
  - `/api/auth/*`
  - `/api/v1/dailyitems*`
  - `/api/v1/transactions*`
  - `/api/v1/admin*`
- Request/response JSON structure remains backward compatible for current Angular consumers.
- Validation and authorization semantics remain unchanged unless explicitly versioned.
- Error responses continue to follow ProblemDetails-style payloads for failures.

## Endpoint Groups

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/register`

Contract expectations:

- Returns access token and user identity/role metadata.
- Invalid credentials/registration validation return stable error semantics.

### Daily Items

- `GET /api/v1/dailyitems`
- `GET /api/v1/dailyitems/paged?page={n}&pageSize={n}`
- `POST /api/v1/dailyitems`
- `PUT /api/v1/dailyitems/{id}`
- `DELETE /api/v1/dailyitems/{id}`

Contract expectations:

- Pagination shape remains stable for paged endpoint.
- CRUD authorization and validation behavior remain consistent.

### Transactions

- `GET /api/v1/transactions?from={date}&to={date}[&userId={id}]`
- `GET /api/v1/transactions/paged?...`
- `GET /api/v1/transactions/{id}`
- `GET /api/v1/transactions/summary/{year}/{month}`
- `POST /api/v1/transactions`
- `PUT /api/v1/transactions/{id}`
- `DELETE /api/v1/transactions/{id}`

Contract expectations:

- Query parameter semantics unchanged.
- Summary aggregation behavior unchanged for equivalent input ranges.

### Admin

- `GET /api/v1/admin/summary/{year}/{month}`
- `GET /api/v1/admin/users?page={n}&pageSize={n}`
- `PUT /api/v1/admin/users/{userId}/role`
- `PUT /api/v1/admin/users/{userId}/password`
- `DELETE /api/v1/admin/users/{userId}`

Contract expectations:

- Admin-only route protections remain intact.
- User management side-effects remain auditable.

## Compatibility Policy

- Allowed in this feature:
  - Internal implementation movement across layers.
  - Additive non-breaking fields when clients can ignore unknown fields.
- Not allowed in this feature:
  - Removing or renaming existing routes.
  - Breaking DTO shape changes without version strategy.
  - Changing auth policy semantics without explicit approval.

## Verification Evidence

- Contract test suite validates route availability, status behavior, response shape, and key validation/auth failures.
- Integration tests validate persistence and orchestration behavior for migrated slices.

## Migration Parity Assertions

- Layer migration MUST keep `/api/auth/*` and `/api/v1/*` routes externally unchanged.
- Authorization semantics for admin-protected endpoints MUST remain equivalent.
- Validation and ProblemDetails-style error behavior MUST remain stable for known invalid inputs.
- Any detected contract drift MUST be explicitly documented and gated behind versioned change policy.
