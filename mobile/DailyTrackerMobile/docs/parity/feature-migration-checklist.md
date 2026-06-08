# Angular to Mobile Feature Migration Checklist

This checklist compares the Angular client feature set to the current React Native parity baseline in `mobile/DailyTrackerMobile`.

Status key:

- `Done` = implemented in mobile beyond documentation only
- `Baseline` = route or API contract stub exists, but feature UI/flow is not implemented yet
- `Missing` = not present in the mobile workspace yet

## Auth

- [Baseline] Login route and API contract mapping exist.
- [Baseline] Register route and API contract mapping exist.
- [Missing] Real mobile login screen with form validation and submit flow.
- [Missing] Real mobile register screen with form validation and submit flow.
- [Missing] JWT session persistence and automatic restore on app launch.
- [Missing] Auth guards / guest guards / route blocking equivalent.
- [Missing] Auth error handling and redirect behavior equivalent to Angular interceptors.

## Home

- [Missing] Home dashboard screen.
- [Missing] Greeting, monthly summary cards, recent activity, and admin summary widgets.
- [Missing] Role-aware home experience for admin vs regular user.

## Items

- [Baseline] Items API route contract exists.
- [Baseline] Items service stub exists.
- [Missing] Items list screen.
- [Missing] Create item form and validation.
- [Missing] Edit item flow.
- [Missing] Delete item flow.
- [Missing] Admin-only item management permissions in UI.

## Transactions

- [Baseline] Transactions API route contract exists.
- [Baseline] Transactions service stub exists.
- [Missing] Transactions list screen.
- [Missing] Date-range filtering.
- [Missing] Paged transactions browsing.
- [Missing] Create transaction flow.
- [Missing] Edit transaction flow.
- [Missing] Delete transaction flow.
- [Missing] Monthly summary display.
- [Missing] User filter for admin transaction views.

## Admin

- [Baseline] Admin API route contract exists.
- [Baseline] Admin service stub exists.
- [Missing] Admin users list screen.
- [Missing] Role assignment flow.
- [Missing] Password change flow.
- [Missing] User deletion flow.
- [Missing] Admin summary and user-management UI.

## Navigation And Shell

- [Baseline] App route map exists.
- [Missing] Real mobile navigation stack and nested screen flow.
- [Missing] Shared shell / layout equivalent to Angular app shell.
- [Missing] Shared nav / tab / drawer experience.

## Cross-Cutting Behavior

- [Baseline] API route constants exist in `src/api/contracts.ts`.
- [Missing] Real HTTP client implementation.
- [Missing] Error handling, loading states, and retry behavior.
- [Missing] Local storage or secure storage session strategy.
- [Missing] Offline caching or sync strategy.

## Deferred Enhancements

The following are intentionally out of scope for the initial parity baseline:

- [Deferred] Offline-first caching and sync strategy.
- [Deferred] Push notification workflows.
- [Deferred] Mobile-native biometric auth convenience flow.

## Current Baseline Summary

The mobile workspace currently provides:

- API route contract scaffolding.
- Service placeholders for auth, items, transactions, and admin.
- Navigation route enumeration.
- Parity journey documentation.

It does not yet provide full feature parity with the Angular client screens and behaviors.
