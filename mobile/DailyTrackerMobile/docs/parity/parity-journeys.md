# Parity Journeys

## PJ-001 Auth Login/Register
- Preconditions: unauthenticated user
- Inputs: username/email/password
- Expected outputs: token and role-bound navigation context
- Error behavior: validation and credential errors surfaced
- Status: Planned

## PJ-002 Items CRUD
- Preconditions: authenticated user
- Inputs: item data changes
- Expected outputs: persisted item list updates
- Error behavior: validation and authorization errors surfaced
- Status: Planned

## PJ-003 Transactions CRUD + Summary
- Preconditions: authenticated user, date range selection
- Inputs: transaction values and date filters
- Expected outputs: list and monthly summary consistency
- Error behavior: invalid range/permissions handled
- Status: Planned

## PJ-004 Admin User Management
- Preconditions: admin role
- Inputs: role/password/delete actions
- Expected outputs: user state updates and admin summary consistency
- Error behavior: authorization and validation errors surfaced
- Status: Planned
