# Tasks: Layered Backend and Mobile Parity Baseline

**Input**: Design documents from /specs/001-split-layers-rn-port/

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included because this feature requires regression evidence and contract verification.

**Organization**: Tasks are grouped by user story for independent implementation and validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize solution layout for layered backend and mobile parity baseline work.

- [x] T001 Create backend solution folders in src/ and tests/ per plan in specs/001-split-layers-rn-port/plan.md
- [x] T002 Create Domain project scaffold in src/DailyTracker.Domain/DailyTracker.Domain.csproj
- [x] T003 Create Application project scaffold in src/DailyTracker.Application/DailyTracker.Application.csproj
- [x] T004 Create Infrastructure project scaffold in src/DailyTracker.Infrastructure/DailyTracker.Infrastructure.csproj
- [x] T005 Create API host project scaffold in src/DailyTracker.Api/DailyTracker.Api.csproj
- [x] T006 [P] Create backend test project scaffolds in tests/DailyTracker.Domain.Tests/DailyTracker.Domain.Tests.csproj
- [x] T007 [P] Create backend test project scaffolds in tests/DailyTracker.Application.Tests/DailyTracker.Application.Tests.csproj
- [x] T008 [P] Create backend test project scaffolds in tests/DailyTracker.Infrastructure.Tests/DailyTracker.Infrastructure.Tests.csproj
- [x] T009 [P] Create backend test project scaffolds in tests/DailyTracker.Api.IntegrationTests/DailyTracker.Api.IntegrationTests.csproj
- [x] T010 [P] Create backend test project scaffolds in tests/DailyTracker.Contracts.Tests/DailyTracker.Contracts.Tests.csproj
- [x] T011 Add new project entries and references to DailyTrackerService.sln
- [x] T012 [P] Scaffold React Native app container in mobile/DailyTrackerMobile/package.json
- [x] T013 [P] Create parity documentation workspace in mobile/DailyTrackerMobile/docs/parity/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core contracts, composition, and shared verification infrastructure required by all stories.

**CRITICAL**: No user story work starts before this phase is complete.

- [x] T014 Define layer dependency rules and ownership matrix in specs/001-split-layers-rn-port/contracts/layer-boundaries.md
- [x] T015 [P] Define API compatibility checklist for migration in specs/001-split-layers-rn-port/contracts/compatibility-checklist.md
- [x] T016 [P] Create shared domain abstractions in src/DailyTracker.Domain/Abstractions/
- [x] T017 [P] Create shared DTO and contract interfaces in src/DailyTracker.Application/Contracts/
- [x] T018 Move persistence primitives and DbContext baseline into src/DailyTracker.Infrastructure/Persistence/
- [x] T019 Establish API composition root and dependency wiring in src/DailyTracker.Api/Program.cs
- [x] T020 Configure shared test utilities and fixtures in tests/DailyTracker.Api.IntegrationTests/TestHostFactory.cs
- [x] T021 [P] Configure contract snapshot baselines for key endpoints in tests/DailyTracker.Contracts.Tests/ContractSnapshots/
- [x] T022 [P] Create parity journey schema template in mobile/DailyTrackerMobile/docs/parity/parity-journey-template.md
- [x] T023 Configure CI build/test matrix for old and new backend projects in .github/workflows/ci.yml

**Checkpoint**: Foundation complete; story work can proceed.

---

## Phase 3: User Story 1 - Layered Backend Separation (Priority: P1) MVP

**Goal**: Split backend into Domain/Application/Infrastructure/API layers while preserving existing API behavior.

**Independent Test**: Existing auth/items/transactions/admin API flows behave the same after migration.

### Tests for User Story 1

- [x] T024 [P] [US1] Add contract tests for auth endpoints in tests/DailyTracker.Contracts.Tests/AuthContractTests.cs
- [x] T025 [P] [US1] Add contract tests for daily item endpoints in tests/DailyTracker.Contracts.Tests/DailyItemsContractTests.cs
- [x] T026 [P] [US1] Add contract tests for transaction endpoints in tests/DailyTracker.Contracts.Tests/TransactionsContractTests.cs
- [x] T027 [P] [US1] Add contract tests for admin endpoints in tests/DailyTracker.Contracts.Tests/AdminContractTests.cs
- [x] T028 [P] [US1] Add integration tests for authentication and authorization behavior in tests/DailyTracker.Api.IntegrationTests/AuthFlowTests.cs
- [x] T029 [P] [US1] Add integration tests for CRUD and summary flows in tests/DailyTracker.Api.IntegrationTests/CoreFlowsTests.cs

### Implementation for User Story 1

- [x] T030 [P] [US1] Move core entities User Role DailyItem Transaction into src/DailyTracker.Domain/Entities/
- [x] T031 [P] [US1] Move domain-level enums and value objects into src/DailyTracker.Domain/Enums/ and src/DailyTracker.Domain/ValueObjects/
- [x] T032 [US1] Port application service contracts and use cases into src/DailyTracker.Application/UseCases/
- [x] T033 [US1] Move repository implementations and EF mappings into src/DailyTracker.Infrastructure/Repositories/ and src/DailyTracker.Infrastructure/Persistence/
- [x] T034 [US1] Move API controllers and middleware into src/DailyTracker.Api/Controllers/ and src/DailyTracker.Api/Middleware/
- [x] T035 [US1] Rewire dependency injection and auth/audit middleware in src/DailyTracker.Api/Program.cs
- [x] T036 [US1] Preserve v1 route behavior and API response parity assertions in specs/001-split-layers-rn-port/contracts/backend-api-contract.md
- [x] T037 [US1] Validate migration by running regression suite and record results in specs/001-split-layers-rn-port/checklists/backend-regression.md

**Checkpoint**: Layered backend is functional and API-compatible.

---

## Phase 4: User Story 2 - Web-to-Mobile Functional Parity Definition (Priority: P2)

**Goal**: Produce complete web-to-mobile parity baseline and initial mobile implementation skeleton aligned to existing behavior.

**Independent Test**: Every core Angular journey maps to mobile acceptance criteria and API interactions.

### Tests for User Story 2

- [x] T038 [P] [US2] Add parity validation tests for auth journey mapping in mobile/DailyTrackerMobile/tests/parity/auth-parity.spec.ts
- [x] T039 [P] [US2] Add parity validation tests for items and transactions journey mapping in mobile/DailyTrackerMobile/tests/parity/core-parity.spec.ts
- [x] T040 [P] [US2] Add parity validation tests for admin journey mapping in mobile/DailyTrackerMobile/tests/parity/admin-parity.spec.ts

### Implementation for User Story 2

- [x] T041 [P] [US2] Document Angular feature inventory and routes in mobile/DailyTrackerMobile/docs/parity/angular-feature-inventory.md
- [x] T042 [P] [US2] Create parity journey catalog with acceptance criteria in mobile/DailyTrackerMobile/docs/parity/parity-journeys.md
- [x] T043 [US2] Define mobile navigation and feature module map in mobile/DailyTrackerMobile/src/navigation/appNavigator.ts
- [x] T044 [US2] Implement shared API client contracts aligned with backend endpoints in mobile/DailyTrackerMobile/src/api/contracts.ts
- [x] T045 [US2] Implement auth and token session service baseline in mobile/DailyTrackerMobile/src/features/auth/authService.ts
- [x] T046 [US2] Implement items and transactions API service baseline in mobile/DailyTrackerMobile/src/features/core/dataService.ts
- [x] T047 [US2] Implement admin API service baseline in mobile/DailyTrackerMobile/src/features/admin/adminService.ts
- [x] T048 [US2] Record parity sign-off evidence and gaps in specs/001-split-layers-rn-port/checklists/parity-signoff.md

**Checkpoint**: Parity baseline is documented and mobile skeleton is aligned to current behavior.

---

## Phase 5: User Story 3 - Mobile Readiness for Future Iterations (Priority: P3)

**Goal**: Finalize deferred enhancement boundaries so future mobile changes can be added in separate spec cycles.

**Independent Test**: Deferred enhancements are explicitly captured and excluded from this baseline release.

### Tests for User Story 3

- [x] T049 [P] [US3] Add validation test for deferred enhancement registry completeness in mobile/DailyTrackerMobile/tests/parity/deferred-enhancements.spec.ts

### Implementation for User Story 3

- [x] T050 [P] [US3] Create deferred enhancement registry in mobile/DailyTrackerMobile/docs/parity/deferred-enhancements.md
- [x] T051 [US3] Map deferred enhancements to future spec placeholders in specs/001-split-layers-rn-port/contracts/future-enhancements-map.md
- [x] T052 [US3] Define handoff checklist for next mobile iteration in specs/001-split-layers-rn-port/checklists/next-iteration-handoff.md

**Checkpoint**: Baseline is complete and future mobile change intake is structured.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improve quality, consistency, and delivery readiness across all stories.

- [x] T053 [P] Update architecture and migration documentation in specs/001-split-layers-rn-port/quickstart.md
- [x] T054 Run full backend and parity validation suite and record summary in specs/001-split-layers-rn-port/checklists/final-validation.md
- [x] T055 [P] Verify security and audit behavior checklist compliance in specs/001-split-layers-rn-port/checklists/security-audit-checks.md
- [x] T056 [P] Clean up obsolete monolith-only references after migration in DailyTrackerService/

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately.
- Foundational (Phase 2): depends on Setup; blocks all user stories.
- User Story phases (Phases 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of all targeted user stories.

### User Story Dependencies

- US1 (P1): no dependency on other user stories; enables stable backend base.
- US2 (P2): depends on US1 contract stability for accurate parity mapping.
- US3 (P3): depends on US2 parity catalog to identify what is deferred.

### Within Each User Story

- Tests are written before implementation and must initially fail.
- Core models/contracts before services.
- Services before controllers/screens.
- Story verification before moving to next priority.

### Parallel Opportunities

- Phase 1 project scaffolding tasks marked [P] can run in parallel.
- Phase 2 contract/schema tasks marked [P] can run in parallel.
- US1 contract and integration tests can run in parallel by endpoint group.
- US2 parity tests and documentation tasks can run in parallel by feature area.
- US3 deferred-registry and mapping tasks can run in parallel.

## Parallel Example: User Story 1

- T024, T025, T026, T027 can run together in tests/DailyTracker.Contracts.Tests/
- T030 and T031 can run together in src/DailyTracker.Domain/

## Parallel Example: User Story 2

- T038, T039, T040 can run together in mobile/DailyTrackerMobile/tests/parity/
- T041 and T042 can run together in mobile/DailyTrackerMobile/docs/parity/

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete all US1 tests and implementation tasks.
3. Validate backend contract compatibility and regression evidence.
4. Stop for review/demo before starting mobile parity work.

### Incremental Delivery

1. Deliver layered backend separation (US1).
2. Deliver web-to-mobile parity baseline and mobile skeleton (US2).
3. Deliver deferred-enhancement readiness artifacts (US3).
4. Run polish and final validation.

### Team Parallel Strategy

1. Team A: backend layering and contract regression (US1).
2. Team B: parity inventory and mobile skeleton (US2, after US1 contract stabilization).
3. Team C: deferred enhancement governance artifacts (US3, after parity catalog baseline).
