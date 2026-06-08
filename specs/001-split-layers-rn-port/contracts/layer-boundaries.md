# Layer Boundaries

## Dependency Direction
- DailyTracker.Api -> DailyTracker.Application -> DailyTracker.Domain
- DailyTracker.Infrastructure -> DailyTracker.Application and DailyTracker.Domain
- DailyTracker.Domain has no dependency on other project implementations.

## Ownership Matrix
- Domain: entities, value objects, invariants.
- Application: contracts, use case orchestration, DTO mapping.
- Infrastructure: persistence, repository implementations, external adapters.
- API: controllers, middleware, composition root.
