# Change: Audit MVP sensitive mutations

## Why

The audit store and read API exist, but instrumentation is intentionally partial. Floor, Ordering,
Kitchen and Cash can change operational, monetary and access-sensitive state without a uniform
append-only record, so the MVP cannot reconstruct who changed what, when and with which result.

## What Changes

- Define a mandatory audit policy and action vocabulary for state-changing MVP operations.
- Instrument Floor, Ordering, Kitchen and Cash mutations with actor, branch, resource, transition,
  outcome, reason and correlation evidence.
- Record successful business mutation and audit evidence atomically.
- Record denied and failed sensitive attempts without persisting secrets or raw payment data.
- Centralize redaction and size limits for previous/new state evidence.
- Add tenant/branch-scoped queries and coverage tests that fail when a sensitive mutation lacks an
  audit policy.
- Add operational metrics and alerts for audit persistence failures.

## Impact

- Affected specs: SPEC-044, SPEC-045, SPEC-052–065, SPEC-087–110, SPEC-124–136, SPEC-219 and
  SPEC-222.
- Affected code: audit domain and persistence, Floor, Ordering, Kitchen and Cash application
  commands, API composition and tests.
- Data: additive audit columns and indexes require a forward/rollback migration.

