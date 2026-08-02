> Historial de implementación migrado al árbol SDD; SPEC-059 es la fuente normativa vigente.

# Change: Add pending-check payments to Cash

## Why

Cash can operate sessions, ledger movements and reconciliation, but it cannot discover restaurant
checks waiting for payment or complete a manual payment from its UI. The authoritative MVP journey
therefore stops before payment and cannot prove table-to-close behavior.

## What Changes

- Expose a tenant- and branch-scoped read model for checks in `PAYMENT_PENDING`.
- Show an accessible `Cobros pendientes` region in Cash with table, guest, line and balance context.
- Let an authorized cashier create and capture one manual payment using the existing payment
  lifecycle.
- Require the selected open cash session for `CASH` captures and record the corresponding cash
  movement through the existing API orchestration.
- Settle the check after an exact-balance capture and refresh the queue from persisted state.
- Preserve idempotency, integer minor-unit arithmetic, audit evidence and HTTP telemetry.

## Impact

- Affected specs: SPEC-052, SPEC-053, SPEC-058, SPEC-059, SPEC-135, SPEC-215, SPEC-219 and
  SPEC-222.
- Affected code: Floor check repository ports/adapters, Checks API, Cash application UI/types and
  API/E2E coverage.
- Follow-up: the authoritative journey must complete delivery, visit close, table release and
  cross-tenant evidence in its own release-gate branch.
