<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. Contract-First Multi-Client API
	- Template Principle 2 -> II. Versioned and Non-Breaking Evolution
	- Template Principle 3 -> III. Test Evidence Is Mandatory
	- Template Principle 4 -> IV. Security, Validation, and Auditability by Default
	- Template Principle 5 -> V. Maintainable Vertical Slices
- Added sections:
	- Technology & Architecture Constraints
	- Delivery Workflow & Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ✅ reviewed (no change needed): .specify/templates/spec-template.md
	- ✅ reviewed (no change needed): .specify/extensions/git/commands/speckit.git.initialize.md
	- ✅ reviewed (no change needed): .specify/extensions/git/commands/speckit.git.feature.md
	- ✅ reviewed (no change needed): .specify/extensions/git/commands/speckit.git.commit.md
	- ✅ reviewed (no change needed): .specify/extensions/git/commands/speckit.git.remote.md
	- ✅ reviewed (no change needed): .specify/extensions/git/commands/speckit.git.validate.md
	- ✅ reviewed (no change needed): .specify/extensions/agent-context/commands/speckit.agent-context.update.md
	- ✅ reviewed (no change needed): client/README.md
- Follow-up TODOs:
	- TODO(RN_ARCHITECTURE_DETAILS): Capture concrete React Native architecture, authentication flow, and offline strategy in /speckit.specify before /speckit.plan.
-->

# DailyTrackerService Constitution

## Core Principles

### I. Contract-First Multi-Client API

All externally consumed behavior MUST be defined at the API contract boundary
before implementation changes are merged. API request/response schemas,
validation rules, and error shapes MUST be stable across Angular and future
React Native clients. Any API change MUST document client impact and migration
path in the active spec. Rationale: this codebase serves multiple client
applications and contract drift creates expensive cross-client regressions.

### II. Versioned and Non-Breaking Evolution

Public API behavior MUST evolve through explicit versioning or additive changes.
Breaking changes to existing consumers MUST NOT ship without a deprecation
window, migration notes, and approval captured in plan artifacts. Existing v1
controller behavior MUST remain backward compatible unless the spec explicitly
declares a governed break. Rationale: production clients must keep working while
the service evolves.

### III. Test Evidence Is Mandatory

Every API-affecting change MUST include automated verification at the
appropriate layer: unit tests for business rules, integration tests for service
and persistence behavior, and contract tests for externally visible endpoints.
No feature is complete until failing scenarios are covered (validation,
authorization, and error paths). Rationale: test evidence is the enforceable
proof that API and domain behavior remain correct across clients.

### IV. Security, Validation, and Auditability by Default

Authentication, authorization, and input validation MUST be enforced server-side
for all protected operations. Sensitive actions MUST be auditable through
existing logging/auditing infrastructure, and security-relevant failures MUST
return consistent, non-leaking error responses. Rationale: client diversity does
not weaken server trust boundaries; the API remains the security authority.

### V. Maintainable Vertical Slices

Changes MUST preserve clear layering and ownership: Controllers orchestrate,
Services hold business behavior, Repositories handle persistence, and DTOs
define boundaries. Cross-cutting concerns (exceptions, middleware, auditing,
mapping) MUST stay centralized and reusable. Rationale: consistent vertical
slice boundaries keep backend changes predictable as new clients are added.

## Technology & Architecture Constraints

- Backend runtime MUST remain ASP.NET Core on .NET with Entity Framework-based
  persistence unless a migration is explicitly planned.
- Existing Angular client behavior MUST be preserved for unchanged user flows.
- React Native requirements are explicitly in-scope for upcoming specs; detailed
  mobile architecture decisions are deferred to specification and planning.
- API payloads MUST be JSON and support stable parsing across web and mobile
  clients.
- Observability MUST use existing logging and audit mechanisms before introducing
  new telemetry frameworks.

## Delivery Workflow & Quality Gates

- `/speckit.specify` MUST describe user stories and acceptance outcomes for both
  current web client impact and future mobile impact where applicable.
- `/speckit.plan` MUST pass a Constitution Check that verifies contract
  compatibility, test coverage intent, and security/audit implications.
- `/speckit.tasks` MUST include explicit tasks for API contract updates, backend
  tests, and client-impact validation.
- Pull requests MUST include evidence of tests executed and any required data
  migration or rollback notes.
- Reviewers MUST block merges when constitution rules are not demonstrably met.

## Governance

<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution is the top-level engineering policy for Spec Kit artifacts in
this repository. When conflicts arise, this constitution takes precedence over
ad hoc practices.

Amendment policy:

- Amendments MUST be proposed via `/speckit.constitution` with explicit rationale
  and a Sync Impact Report.
- Any principle addition/removal or meaning-changing rewrite requires at least a
  MINOR version increment; incompatible governance changes require MAJOR.
- Clarifications with no policy impact use PATCH increments.

Compliance policy:

- Every plan and task set MUST include an explicit constitution compliance check.
- Code reviews MUST verify compliance evidence before approval.
- Exceptions MUST be documented in the relevant plan with a time-bound follow-up.

**Version**: 1.0.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-06-05

<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
