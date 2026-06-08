# Implementation Plan: Layered Backend and Mobile Parity Baseline

**Branch**: `002-split-layers-rn-port` | **Date**: 2026-06-05 | **Spec**: `/specs/001-split-layers-rn-port/spec.md`

**Input**: Feature specification from `/specs/001-split-layers-rn-port/spec.md`

## Summary

Restructure the backend from a single Web API project into layered projects
(Domain, Application, Infrastructure, API) while preserving existing API
behavior and Angular client compatibility. In parallel, produce a complete
web-to-mobile parity baseline so the first React Native implementation can
replicate existing business outcomes and defer non-parity mobile enhancements to
future specs.

## Technical Context

**Language/Version**: C# 13 on .NET 9 (`net9.0`) for backend, TypeScript 5.9
with Angular 21 for web client, TypeScript (React Native baseline) for mobile.

**Primary Dependencies**:

- Backend: ASP.NET Core Web API, Entity Framework Core 9 (SQLite provider), JWT
  Bearer auth, API Versioning (`Asp.Versioning.Mvc`), Swagger/Swashbuckle.
- Web client: Angular 21, RxJS 7, HttpClient with route guards/interceptors.
- Mobile baseline: React Native with TypeScript, React Navigation, API client
  layer aligned to existing REST contract.

**Storage**: SQLite (`dailytracker.db`) via EF Core; audit trail written through
existing audit logger pipeline.

**Testing**:

- Backend: xUnit + FluentAssertions for unit and application tests; ASP.NET Core
  integration tests using `WebApplicationFactory` and test database lifecycle.
- Contract: API contract regression suite for key endpoints used by auth, items,
  transactions, and admin features.
- Web/mobile parity: scenario-based acceptance matrix validating equivalent
  business outcomes per journey.

**Target Platform**:

- API: Linux/container-friendly ASP.NET Core deployment.
- Web: modern evergreen browsers.
- Mobile: iOS and Android React Native runtime.

**Project Type**: Multi-project backend service + web frontend + mobile client
parity baseline documentation.

**Performance Goals**:

- No measurable regression for existing API endpoints versus current baseline.
- Preserve existing pagination and summary endpoint responsiveness.
- Mobile parity flows should maintain acceptable UX under typical API latency.

**Constraints**:

- Preserve existing `/api/auth` and `/api/v1/*` contracts unless explicitly
  versioned/deprecated.
- Maintain server-side authz/validation/auditing behavior.
- Migration must be incremental and buildable at each step.
- Mobile scope is parity baseline only; no extra mobile-only features in this
  plan.

**Scale/Scope**:

- Existing bounded domains: Auth, Daily Items, Transactions, Admin/User
  management.
- Angular features to parity-map: login/register, home summary, items CRUD,
  transaction CRUD/reporting, admin user management.
- Backend refactor spans entire service composition root and project references.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- PASS: API contract impact is documented in research and contracts artifacts for
  auth/items/transactions/admin endpoints with Angular + React Native parity
  constraints.
- PASS: Backward compatibility strategy is additive and non-breaking for
  existing clients; no route or response schema removals in this phase.
- PASS: Test evidence strategy includes unit, integration, and contract
  regression coverage.
- PASS: Security/audit implications are captured for JWT authn/authz, validation,
  and auditing of state-changing operations.
- PASS: Layer boundaries (Domain/Application/Infrastructure/API) are explicit in
  target structure and dependency rules.

## Project Structure

### Documentation (this feature)

```text
specs/001-split-layers-rn-port/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
DailyTrackerService.sln
DailyTrackerService/                  # current monolith API project (source of extraction)
client/                               # Angular web client

# target backend layering (new projects to be introduced)
src/
├── DailyTracker.Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   └── Abstractions/
├── DailyTracker.Application/
│   ├── Contracts/
│   ├── UseCases/
│   ├── Dtos/
│   ├── Validators/
│   └── Mapping/
├── DailyTracker.Infrastructure/
│   ├── Persistence/
│   ├── Repositories/
│   ├── Security/
│   ├── Auditing/
│   └── Configuration/
└── DailyTracker.Api/
    ├── Controllers/
    ├── Middleware/
    ├── Versioning/
    └── Composition/

tests/
├── DailyTracker.Domain.Tests/
├── DailyTracker.Application.Tests/
├── DailyTracker.Infrastructure.Tests/
├── DailyTracker.Api.IntegrationTests/
└── DailyTracker.Contracts.Tests/

mobile/
└── DailyTrackerMobile/               # React Native app (parity baseline phase)
```

**Structure Decision**: Adopt a layered backend architecture with strict
dependency direction (Api -> Application -> Domain, Infrastructure ->
Application/Domain via interfaces) while preserving the existing Angular app and
introducing a React Native project for parity implementation.

## Post-Design Constitution Check

- PASS: Contracts artifact defines externally visible API behaviors and
  compatibility expectations across web/mobile.
- PASS: Data model and layer ownership rules enforce non-breaking evolution and
  clear boundaries.
- PASS: Quickstart includes test evidence requirements for contract/integration
  verification.
- PASS: Security and auditing requirements are preserved in planned migration
  steps.

## Complexity Tracking

No constitution violations identified for this plan.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
