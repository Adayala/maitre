# Change: Add the authoritative MVP E2E journey

## Why

The Playwright projects exercise individual application shells and several rich UI flows, but
those flows fulfill API requests inside the browser. They do not prove that the production builds,
real API composition and shared persistence complete the authoritative table-to-close journey
across Floor, Kitchen and Cash.

## What Changes

- Add a cross-application Playwright `journeys` project that starts the real API and required
  production frontend builds.
- Provision deterministic tenant, branch, roles, menu, station, register and service-period data
  through a controlled E2E setup boundary.
- Exercise table seating, order submission, kitchen production, delivery, bill request, manual
  payment, visit close and table release through the user interfaces.
- Verify intermediate/final state through black-box API reads and cross-tenant negative checks.
- Prohibit request fulfillment/mocking for the authoritative release journey.
- Publish reproducible run metadata, Playwright traces/screenshots on failure and sanitized API
  diagnostics.
- Make the journey a fail-closed release/deploy dependency.

## Impact

- Affected specs: SPEC-213, SPEC-215, SPEC-219, SPEC-222, SPEC-224 and the Floor/Ordering/Kitchen/
  Cash workflows.
- Affected code: Playwright configuration, E2E provisioner/fixtures/support, CI affected-project
  detection and application selectors/interactions where necessary.
- Dependency: Cash must expose pending checks and manual payment completion through its UI; the
  journey cannot be accepted by simulating that missing behavior.

