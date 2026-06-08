# Mobile Implementation Tasks

This task list expands [mobile-implementation-plan.md](mobile-implementation-plan.md) into buildable slices.

## Phase 1: Auth Foundation

- [x] M001 Build login screen UI with validation.
- [x] M002 Build register screen UI with validation.
- [x] M003 [P] Implement auth API client calls for login and register.
- [x] M004 Persist JWT/session data securely for the baseline.
- [x] M005 Restore session on app launch.
- [x] M006 Add auth-aware navigation and protected route handling.
- [x] M007 Add auth failure, validation, and redirect error handling.

**Checkpoint**: A user can register, log in, and stay signed in across app restarts.

## Phase 2: Shell And Navigation

- [x] M008 Replace route enum stubs with a real navigation stack.
- [x] M009 Add the authenticated shell layout.
- [x] M010 Add navigation affordances for Home, Items, Transactions, and Admin.
- [x] M011 Ensure logout clears session and returns to guest flow.

**Checkpoint**: The app has a stable guest/authenticated shell and navigation flow.

## Phase 3: Items Parity Slice

- [x] M012 Build the items list screen.
- [x] M013 Wire items loading from the backend.
- [x] M014 Add create item flow with validation.
- [x] M015 Add edit item flow.
- [x] M016 Add delete item flow.
- [x] M017 Enforce admin-only item controls in the UI.

**Checkpoint**: Items can be listed, created, updated, and deleted from mobile.

## Phase 4: Transactions Parity Slice

- [x] M018 Build the transactions list screen.
- [x] M019 Add date-range filtering.
- [x] M020 Add paged browsing.
- [x] M021 Add create transaction flow.
- [x] M022 Add edit transaction flow.
- [x] M023 Add delete transaction flow.
- [x] M024 Display monthly summary data.
- [x] M025 Support admin-only user filters in transaction views.

**Checkpoint**: Transaction CRUD, paging, and monthly summary match the backend contract.

## Phase 5: Home Dashboard

- [x] M026 Build the home dashboard screen.
- [x] M027 Add greeting and role-aware presentation.
- [x] M028 Add monthly summary cards.
- [x] M029 Add recent activity display.
- [x] M030 Add admin summary widgets for admin users.

**Checkpoint**: Home shows a useful role-sensitive snapshot of the account.

## Phase 6: Admin Parity Slice

- [x] M031 Build the admin users list screen.
- [x] M032 Add role assignment flow.
- [x] M033 Add password change flow.
- [x] M034 Add user deletion flow.
- [x] M035 Add admin summary and user-management affordances.

**Checkpoint**: Admin users can manage accounts from mobile.

## Phase 7: Cross-Cutting Hardening

- [x] M036 Replace service stubs with real API clients.
- [x] M037 Standardize error, loading, and empty states.
- [x] M038 Add retry behavior where useful.
- [x] M039 Add local storage or secure storage helpers.
- [x] M040 Add parity tests for each screen slice.

**Checkpoint**: The mobile baseline is feature-complete enough for parity verification.

## Deferred Enhancements

- [ ] D001 Offline-first caching and sync.
- [ ] D002 Push notifications.
- [ ] D003 Biometric convenience auth.

## Recommended Build Order

1. M001-M007 Auth foundation.
2. M008-M011 Shell and navigation.
3. M012-M017 Items.
4. M018-M025 Transactions.
5. M026-M030 Home.
6. M031-M035 Admin.
7. M036-M040 Cross-cutting hardening and tests.
