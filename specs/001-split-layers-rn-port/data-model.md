# Data Model: Layered Backend and Mobile Parity Baseline

## Core Domain Entities

### User

- Purpose: Authenticated system identity with role-based authorization.
- Key fields: `Id`, `Username`, `Email`, `PasswordHash`, `RoleId`, `CreatedAtUtc`, `UpdatedAtUtc`.
- Relationships:
  - One `Role` to many `User`.
  - One `User` to many `Transaction`.
- Validation rules:
  - Username and email are required and unique.
  - Password is never stored in plaintext.

### Role

- Purpose: Authorization grouping (e.g., Admin, User).
- Key fields: `Id`, `Name`.
- Relationships:
  - One `Role` to many `User`.
- Validation rules:
  - Role name is required and unique.

### DailyItem

- Purpose: User-manageable trackable item definition used by transaction records.
- Key fields: `Id`, `Name`, `Type`, `Amount`, `IsActive`, `CreatedByUserId`.
- Relationships:
  - Referenced by many `Transaction` records.
- Validation rules:
  - Name required.
  - Amount/value constraints based on item type.

### Transaction

- Purpose: Time-bounded user event/value capture tied to a daily item.
- Key fields: `Id`, `UserId`, `DailyItemId`, `Date`, `Quantity`, `Notes`, `CreatedAtUtc`.
- Relationships:
  - Many transactions belong to one `User`.
  - Many transactions reference one `DailyItem`.
- Validation rules:
  - Date required.
  - Quantity/value must respect business limits.
  - Referenced `User` and `DailyItem` must exist.

## Planning Entities (Specification/Parity)

### LayerResponsibility

- Purpose: Defines ownership boundaries for code and dependency direction.
- Fields:
  - `layerName` (Domain | Application | Infrastructure | API)
  - `ownedConcerns` (list)
  - `forbiddenDependencies` (list)
  - `publicContracts` (list)
- Validation rules:
  - Each concern maps to exactly one owning layer.
  - Domain has no dependencies on API or infrastructure implementations.

### ParityJourney

- Purpose: Canonical mapping of current Angular workflows to target mobile behavior.
- Fields:
  - `journeyId`
  - `featureArea` (Auth | Home | Items | Transactions | Admin)
  - `preconditions`
  - `inputs`
  - `expectedOutputs`
  - `errorBehavior`
  - `mobileParityStatus` (Planned | Implemented | Verified)
- Validation rules:
  - Every P1/P2 web workflow must have one parity journey.
  - Acceptance criteria must be measurable.

### DeferredEnhancement

- Purpose: Tracks mobile change requests excluded from parity baseline.
- Fields:
  - `requestId`
  - `description`
  - `reasonDeferred`
  - `targetSpec`
  - `priority`
- Validation rules:
  - Must reference a future spec/task entry.
  - Must not block parity baseline sign-off.

## State Transitions

### ParityJourney State

- `Planned` -> `Implemented` -> `Verified`
- Allowed rollback: `Implemented` -> `Planned` when acceptance criteria fail.

### Backend Slice Migration State

- `LegacyOnly` -> `DualMapped` -> `LayerOwned`
- `DualMapped` means behavior retained while ownership shifts; must pass contract and integration tests before `LayerOwned`.
