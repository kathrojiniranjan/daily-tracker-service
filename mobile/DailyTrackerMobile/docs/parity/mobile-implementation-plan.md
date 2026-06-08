# Mobile Implementation Plan

This plan turns the current Angular feature inventory into an executable React Native parity roadmap for `mobile/DailyTrackerMobile`.

## Goal

Deliver the initial mobile app as a functional parity baseline for the most important Angular journeys, in a dependency-safe order:

1. Auth
2. Items
3. Transactions
4. Admin

Cross-cutting work such as navigation, session handling, API client wiring, and error/loading states should be built alongside the feature slices they support.

## Phase 1: Auth Foundation

### Why first

Every other mobile flow depends on a signed-in user, role context, and a stable session strategy.

### Implement

- Build real login screen UI with validation.
- Build real register screen UI with validation.
- Implement HTTP client calls for login/register.
- Persist JWT/session data securely enough for the baseline.
- Restore session on app launch.
- Add auth-aware navigation and route blocking.
- Add error handling for validation and credential failures.

### Acceptance

- User can register, sign in, and land in the authenticated shell.
- User remains signed in after app restart when the token is valid.
- Guest users cannot reach protected routes.

## Phase 2: Shell And Navigation

### Why here

The app needs a consistent mobile frame before content-heavy screens are added.

### Implement

- Replace route enum stubs with a real navigation stack.
- Add authenticated shell layout.
- Add navigation affordances for Home, Items, Transactions, and Admin.
- Ensure logout clears session and returns to guest flow.

### Acceptance

- Authenticated users see a stable shell.
- Navigation between main features works without hard-coded screen jumps.

## Phase 3: Items Parity Slice

### Why next

Items is the smallest end-to-end CRUD slice and proves the data flow after auth.

### Implement

- Build items list screen.
- Wire list loading from the backend.
- Add create item flow with validation.
- Add edit item flow.
- Add delete item flow.
- Enforce admin-only UI affordances where appropriate.

### Acceptance

- Items can be listed, created, updated, and deleted from mobile.
- Non-admin users do not see admin-only item controls.

## Phase 4: Transactions Parity Slice

### Why now

Transactions is the most data-rich user journey and exercises filtering, paging, and summaries.

### Implement

- Build transactions list screen.
- Wire date-range filtering.
- Add paged browsing.
- Add create transaction flow.
- Add edit transaction flow.
- Add delete transaction flow.
- Display monthly summary data.
- Support admin-only user filters on transaction views.

### Acceptance

- Users can manage their transactions from mobile.
- Monthly summary remains consistent with backend contract responses.
- Admins can filter and inspect user transaction data.

## Phase 5: Home Dashboard

### Why after core CRUD

Home depends on auth, transactions, and admin summary data.

### Implement

- Build home dashboard screen.
- Add greeting and role-aware presentation.
- Add monthly summary cards.
- Add recent activity display.
- Add admin summary widgets when the user is an admin.

### Acceptance

- Home gives a useful role-sensitive snapshot of the current account.

## Phase 6: Admin Parity Slice

### Why last

Admin is the most permission-sensitive slice and depends on the auth/session foundation plus backend stability.

### Implement

- Build admin users list screen.
- Add role assignment flow.
- Add password change flow.
- Add user deletion flow.
- Add admin summary and user-management affordances.

### Acceptance

- Admin users can manage users from mobile.
- Unauthorized users cannot reach admin screens or actions.

## Phase 7: Cross-Cutting Hardening

### Implement

- Replace service stubs with real API clients.
- Standardize error, loading, and empty states.
- Add retry behavior where useful.
- Add local storage or secure storage helpers.
- Add parity tests for each screen slice.

### Deferred

The following remain intentionally deferred for a later mobile iteration:

- Offline-first caching and sync.
- Push notifications.
- Biometric convenience auth.

## Recommended Work Order

1. Auth screens and session handling.
2. Navigation shell and protected routes.
3. Items CRUD.
4. Transactions CRUD and summary.
5. Home dashboard.
6. Admin user management.
7. Cross-cutting hardening and parity tests.

## Success Criteria

- Each Angular journey has a corresponding mobile journey with the same business outcome.
- Mobile route and API contract usage stays aligned with the backend.
- The app can be exercised from login through admin management without leaving the mobile workspace.
