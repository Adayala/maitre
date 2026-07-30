## Context

Current application tests use `page.route(...).fulfill(...)` to model API state independently.
They are useful frontend integration tests, but each app owns a different in-memory fixture and no
test observes state propagation across the deployable system. Playwright starts a real API that
these intercepted flows largely bypass.

## Goals / Non-Goals

- Goals:
  - prove one authoritative cross-app MVP journey against real network boundaries;
  - use production builds from one commit and one shared persistence state;
  - make setup deterministic, isolated and replayable;
  - verify business state, tenant isolation and monetary invariants;
  - fail closed on product, harness or cleanup failure.
- Non-Goals:
  - replace the fast mocked UI tests;
  - exhaustively test every validation/state transition in Playwright;
  - contact production payment, fiscal or notification providers;
  - hide missing product functionality behind E2E-only mocks.

## Decisions

### Cross-app journey is a distinct Playwright project

Add a `journeys` project with one test owner and explicit startup of API, Floor, Kitchen and Cash.
The test creates separate authenticated browser contexts/pages for waiter, kitchen and cashier,
all pointing to the same API and run namespace.

Application tests that fulfill network responses remain fast UI-contract coverage and are labeled
accordingly. They do not satisfy the release journey gate.

### The authoritative journey never fulfills product requests

The journey may observe requests/responses for diagnostics, but MUST NOT call `route.fulfill`,
`route.abort` or mutate responses for Maitre API URLs. External provider adapters use server-side
fakes selected by `APP_ENV=e2e`.

### Provisioning is controlled and ephemeral

`tooling/e2e/provision.mjs` creates a run manifest after migrations and readiness. The manifest
contains namespaced synthetic IDs, a fixed business clock, Tenant A/Tenant B, role-specific fixture
principals and the minimum operational configuration.

Fixture identities and setup authority exist only when `APP_ENV=e2e` and a run-scoped bootstrap
secret is present. Startup fails if E2E controls are enabled in a shared/production environment.
Teardown deletes the namespace or destroys the ephemeral database and verifies no run resources
remain.

### State assertions use UI plus black-box reads

Each user action is asserted in the acting UI. Transition boundaries are additionally verified
through authorized API GETs:

1. visit `OPEN`, table occupied;
2. order `SUBMITTED` and check total equals accepted order total;
3. kitchen command reaches `READY`/handoff and order item reaches delivered;
4. check reaches `PAYMENT_PENDING`;
5. payment is captured once for the exact balance and related cash movement exists;
6. check/visit reach `SETTLED`/`CLOSED` and table becomes available.

The test also verifies Tenant B cannot read or mutate one representative Tenant A resource.

### Synchronization is event/state based

Tests wait for UI state, response completion or bounded API polling. Fixed sleeps are prohibited.
Polling reports the last observed state and correlation ID on timeout.

## Authoritative Scenario

`MVP-J-001`:

1. Manager opens the service period through the supported product/API setup step.
2. Waiter seats guests and opens a visit on an available table.
3. Waiter creates an order, adds a product and submits it.
4. Kitchen observes the real command, claims it, starts it, marks it ready and completes handoff.
5. Waiter observes readiness, marks delivery and requests the bill.
6. Cashier sees the pending check, opens/uses the cash session and records one manual cash payment
   for the exact balance.
7. Waiter closes the settled visit.
8. The table is available, totals remain balanced and audit/telemetry correlation evidence exists.

## Risks / Trade-offs

- The journey will expose product gaps, especially Cash check/payment UI. Those are product
  failures and must be fixed rather than mocked.
- Multi-server startup costs more than app-only tests. Keep one authoritative data path and leave
  rule matrices at lower layers.
- In-memory persistence cannot prove migrations/RLS. The release profile ultimately uses ephemeral
  PostgreSQL/Supabase; a temporary in-memory developer profile must be labeled non-release.

## Migration Plan

1. Build deterministic provision/reset helpers and role fixtures.
2. Add the `journeys` project and state-aware API client.
3. Implement `MVP-J-001` until the first genuine product gap; keep the failing evidence visible.
4. Close product gaps in their owning branches and rerun the journey.
5. Enable the fail-closed CI/release gate only with ephemeral PostgreSQL, cleanup verification and
   stable evidence.

Rollback removes the journey from the required gate but retains diagnostics and app-level tests;
it cannot be reported as release E2E coverage while disabled.

