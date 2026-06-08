# Quickstart: Validate Layered Backend and Mobile Parity Baseline

## Prerequisites

- .NET SDK 9 installed.
- Node.js and npm installed for Angular client.
- Existing repository cloned with feature branch `002-split-layers-rn-port`.

## 1) Restore and build backend

```bash
cd DailyTrackerService

dotnet restore

dotnet build
```

Expected outcome:

- Build succeeds for current API project and any newly introduced layered projects.

## 2) Run backend API

```bash
cd DailyTrackerService

dotnet run --project DailyTrackerService.csproj
```

Expected outcome:

- API starts successfully.
- Health endpoints respond (`/health/live`, `/health/ready`, `/health`).

## 3) Run Angular web client against API

```bash
cd client

npm install

npm run start
```

Expected outcome:

- App loads and existing workflows are accessible.
- Core journeys (auth, items, transactions, admin) continue functioning with unchanged API behavior.

## 4) Execute backend verification tests

```bash
cd DailyTrackerService

dotnet test
```

Expected outcome:

- Unit, integration, and contract regression tests pass for migrated slices.

## 5) Validate parity mapping artifacts

- Review [spec.md](./spec.md) user stories and acceptance scenarios.
- Review [data-model.md](./data-model.md) planning entities (`ParityJourney`, `DeferredEnhancement`).
- Review [backend-api-contract.md](./contracts/backend-api-contract.md) and [parity-contract.md](./contracts/parity-contract.md).

Expected outcome:

- Every in-scope Angular journey has a matching mobile parity definition.
- Deferred mobile-only enhancements are explicitly marked out of scope.

## 6) Regression checklist before moving to `/speckit.tasks`

- API route and response compatibility maintained for existing consumers.
- Security/authorization behavior unchanged for protected routes.
- Audit logging remains active for state-changing operations.
- Parity baseline approved by stakeholders.

## 7) Validate layered scaffolding outputs

- Verify projects exist under `src/` for Domain, Application, Infrastructure, and Api.
- Verify test projects exist under `tests/` including contract and integration suites.
- Verify migration artifacts exist under `specs/001-split-layers-rn-port/contracts/` and `checklists/`.

Expected outcome:

- Layer split scaffolding compiles and test suites execute without build regressions.

## 8) Validate mobile parity baseline artifacts

- Review `mobile/DailyTrackerMobile/docs/parity/angular-feature-inventory.md`.
- Review `mobile/DailyTrackerMobile/docs/parity/parity-journeys.md`.
- Review `mobile/DailyTrackerMobile/docs/parity/deferred-enhancements.md`.

Expected outcome:

- Core web journeys are mapped for mobile parity and deferred enhancements are explicitly listed.
