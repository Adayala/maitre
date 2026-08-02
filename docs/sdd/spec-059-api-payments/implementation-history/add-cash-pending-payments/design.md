> Historial de implementación migrado al árbol SDD; SPEC-059 es la fuente normativa vigente.

## Context

The domain already supports `PAYMENT_PENDING` checks, idempotent payment creation, payment capture,
exact-balance check settlement and cash-ledger integration. The missing pieces are a branch-scoped
pending-check read model and a Cash UI that composes those capabilities safely.

## Goals / Non-Goals

- Goals:
  - expose only checks the authenticated cashier may read in the selected branch;
  - display enough context to identify the table and verify the amount before charging;
  - capture an exact-balance manual payment without accepting client-calculated totals;
  - keep retries idempotent and make partial completion recoverable;
  - support keyboard, screen-reader and narrow-screen operation.
- Non-Goals:
  - add split checks, multi-tender payments, provider terminals or asynchronous authorization;
  - close the Visit from Cash;
  - change cash-session reconciliation or manager approval rules;
  - make the cross-application journey a release gate in this change.

## Decisions

### Pending checks are a branch-scoped API read model

`GET /v1/branches/:id/pending-checks` returns checks whose persisted status is
`PAYMENT_PENDING`, enriched with server-calculated totals, payment summary, visit context and table
labels. The endpoint requires `check:read` and enforces the membership branch scope before reading
data.

The check repository gains `listByBranch`; adapters perform tenant and branch filtering at the
persistence boundary. The API does not accept monetary filters or totals from the client.

### Cash composes the existing payment lifecycle

For the selected check, Cash:

1. creates a payment with a per-attempt idempotency key and the current server balance;
2. captures it, passing the active cash-session ID only for `CASH`;
3. settles the check after capture;
4. refetches the pending queue and active-session movements.

If the response is interrupted after capture, the next queue read exposes balance zero and the UI
offers settlement recovery instead of creating another payment. Payment methods remain
`CASH|CARD|OTHER`; no PAN, CVV or provider credential enters the browser.

### Cash capture fails closed without an open compatible session

The `CASH` action is disabled unless the selected register has an `OPEN` session in the check
currency. Server-side session validation remains authoritative. Non-cash methods do not create a
cash movement.

### Operational evidence uses existing global boundaries

The mutation-audit hook records payment/check mutations and HTTP observability emits bounded RED
signals. Payment creation retains its idempotency key and capture retains correlation evidence.
The UI reports Problem Details correlation IDs on failure without exposing payment instrument
data.

## Risks / Trade-offs

- Three existing HTTP mutations are composed rather than hidden behind a new transaction.
  Idempotency and balance-zero recovery make interruptions safe, but the sequence is not a single
  database transaction.
- Listing and enriching checks performs bounded per-check reads. This is acceptable for the MVP
  queue; pagination/batch projections are required before high-volume operation.
- Visit closure stays in Floor so role boundaries remain unchanged.
