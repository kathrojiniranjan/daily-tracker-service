# Web-to-Mobile Parity Contract

This contract defines behavior parity requirements between the existing Angular app and the initial mobile implementation.

## Scope

- In scope: Functional parity for current core user journeys.
- Out of scope: Mobile-specific feature enhancements requested after parity baseline (tracked as deferred enhancements).

## Parity Journey Matrix

### Auth Journeys

- Web source journeys:
  - Login
  - Register
  - Logout/session expiry handling
- Mobile parity requirements:
  - Equivalent success/failure outcomes for login/register.
  - Equivalent role-aware navigation gating after authentication.

### Home Dashboard Journeys

- Web source journeys:
  - Date-range view of transaction activity
  - Monthly summary visibility
- Mobile parity requirements:
  - Equivalent computed summaries for same date inputs.
  - Equivalent empty/error states for unavailable data.

### Daily Items Journeys

- Web source journeys:
  - List items (paged/unpaged views)
  - Create, update, delete item
- Mobile parity requirements:
  - Same CRUD constraints and validation outcomes.
  - Equivalent visibility of created/updated/deleted state after operations.

### Transactions Journeys

- Web source journeys:
  - List by range (paged/unpaged)
  - Create/update/delete transaction
  - View monthly summary
- Mobile parity requirements:
  - Same filter semantics (`from`, `to`, optional `userId`).
  - Equivalent business outcomes after mutation operations.

### Admin Journeys

- Web source journeys:
  - View user list and summary
  - Assign role
  - Change password
  - Delete user
- Mobile parity requirements:
  - Admin-only access enforcement identical to web behavior.
  - Equivalent success/error behavior for user-management actions.

## Acceptance Rules

- Every parity journey must include:
  - Preconditions
  - Inputs
  - Expected outputs
  - Error handling behavior
  - Authorization expectations
- Parity is considered satisfied only when mobile behavior matches web baseline for all in-scope journeys.

## Deferred Enhancements Rule

- Any mobile behavior not present in current web baseline must be recorded as `DeferredEnhancement` and excluded from parity acceptance in this feature.
