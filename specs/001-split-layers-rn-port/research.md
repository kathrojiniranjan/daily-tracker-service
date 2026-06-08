# Research: Layered Backend and Mobile Parity Baseline

## Decision 1: Adopt Clean-Layered .NET solution split (Domain/Application/Infrastructure/API)

- Decision: Introduce separate backend projects aligned to layer responsibilities and migrate existing code incrementally from `DailyTrackerService` monolith structure.
- Rationale: Current mixed concerns across controllers/services/repositories/entities increase coupling and make safe contract evolution harder; a layered split enforces ownership and testability.
- Alternatives considered:
  - Keep monolith project with folder-only conventions: rejected because compile-time dependency boundaries remain weak.
  - Big-bang rewrite into new architecture: rejected due to high regression risk and delayed delivery.

## Decision 2: Preserve API contracts during migration (contract-first, additive changes only)

- Decision: Keep existing auth and v1 routes/DTO behaviors stable; use additive extension or explicit versioning for any required change.
- Rationale: Angular client is in production scope and React Native parity depends on stable behavior definitions.
- Alternatives considered:
  - Break and update all clients at once: rejected due to coordination risk.
  - Freeze backend changes until mobile ships: rejected because architecture work is a prerequisite.

## Decision 3: Use layered test strategy (unit + integration + contract)

- Decision: Require unit tests for domain/application logic, integration tests for API+persistence composition, and contract tests for externally visible endpoint behavior.
- Rationale: Refactor-heavy work needs regression protection at multiple levels.
- Alternatives considered:
  - Integration-only testing: rejected because diagnosis and feedback speed are poor.
  - Unit-only testing: rejected because wiring and contract regressions can slip through.

## Decision 4: Define web-to-mobile parity through journey mapping before feature expansion

- Decision: Build a parity catalog from Angular journeys (auth, home summary, items, transactions, admin) and treat it as the acceptance baseline for initial React Native delivery.
- Rationale: Prevents scope drift and keeps first mobile delivery measurable.
- Alternatives considered:
  - Start coding mobile screens directly from UI screenshots: rejected due to hidden workflow/validation logic.
  - Add mobile-specific enhancements in the same feature: rejected per user direction to defer later changes.

## Decision 5: React Native baseline architecture

- Decision: Plan React Native app with TypeScript, navigation-driven feature modules, API service layer matching existing REST contracts, and secure token storage strategy to be finalized in implementation tasks.
- Rationale: Aligns with maintainable parity implementation while leaving room for later mobile-specific iterations.
- Alternatives considered:
  - Hybrid webview shell: rejected because it does not satisfy native parity intent.
  - Platform-specific iOS/Android first: rejected due to duplicated effort and slower parity delivery.

## Decision 6: Migration execution model

- Decision: Use strangler-style migration by introducing new layered projects and moving one vertical slice at a time (Auth -> Items -> Transactions -> Admin), keeping API endpoints stable.
- Rationale: Limits blast radius and enables continuous verification.
- Alternatives considered:
  - Move by technical type only (all repositories, then all services): rejected because behavior verification becomes difficult.
  - Full parallel duplicate API stack: rejected because maintenance overhead is too high.
