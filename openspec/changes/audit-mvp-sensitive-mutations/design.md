## Context

`AuditLog` is append-only, but has only CRUD actions and optional caller-supplied snapshots.
Instrumentation currently lives in selected route handlers. That makes coverage difficult to
prove, allows successful mutations without evidence, and does not model state transitions,
outcomes or branch context.

## Goals / Non-Goals

- Goals:
  - cover every sensitive MVP mutation in Floor, Ordering, Kitchen and Cash;
  - make successful state and evidence atomic;
  - preserve tenant and branch isolation;
  - produce useful evidence without storing secrets or excessive payloads;
  - make missing audit coverage detectable in tests.
- Non-Goals:
  - log every read request;
  - use audit logs as analytics or domain event transport;
  - store card data, auth tokens, free-form request bodies or kitchen/customer PII;
  - implement long-term legal retention/export in this change.

## Decisions

### Audit policy is explicit and close to the use case

Each sensitive command declares an `AuditPolicy` containing action code, resource type, outcome
rules, redaction projector and required reason policy. Application commands receive an
`AuditRecorderPort`; route handlers only provide trusted actor/request context.

A contract test enumerates registered state-changing routes and command policies. A mutation in a
covered domain without a policy fails the gate.

### Action codes describe business facts

The existing CRUD action remains for compatibility and a new stable `actionCode` identifies facts
such as `VISIT_OPENED`, `ORDER_SUBMITTED`, `KITCHEN_COMMAND_READY`,
`PAYMENT_CAPTURED`, `CASH_MOVEMENT_VOIDED` and `RECONCILIATION_APPROVED`.

Records also include branch ID when applicable, outcome (`SUCCEEDED`, `DENIED`, `FAILED`),
reason code, request ID and correlation ID. Idempotency keys are represented only by a scoped
one-way hash when needed for reconciliation.

### Success evidence participates in the business transaction

Persistent repositories expose a unit-of-work boundary that saves business state, outbox records
and required success audit entries in one PostgreSQL transaction. If the audit insert fails, the
business mutation rolls back.

Denied requests and failures that do not commit business state are appended separately through a
best-effort failure-evidence path. Failure to write this secondary evidence is logged, metered and
alerted; it never turns a denial into success.

### Evidence is projected and bounded

Each policy produces an allowlisted summary or diff. Global sanitization rejects known secret and
payment credential fields, truncates oversized strings/collections and enforces a serialized size
budget. Money is stored in integer minor units with currency. Reasons use stable codes plus an
optional bounded operator note.

## Sensitive Mutation Matrix

- Floor: service-period transitions; visit open, move, close request, close, reopen and cancel;
  occupancy changes; check create, line/adjustment change, payment request, settle and void.
- Ordering: order create, item add/update/cancel, submit, cancel, delivery state changes and
  manager adjustments.
- Kitchen: command claim, start, pause, resume, ready, serve, cancel and reroute; station lifecycle;
  alert acknowledgement and resolution.
- Cash: register lifecycle; session open, suspend, resume and close; movement record/void;
  reconciliation count, submit, approve and reopen; payment create, capture, fail, void and refund;
  discount approval, application and revocation.

## Risks / Trade-offs

- Atomic integration touches repository boundaries. Migrate one domain at a time behind the same
  policy contract and prohibit partial enablement in production.
- Audit volume grows. Add targeted indexes and monitor rate/size before setting retention.
- Overly rich evidence can leak data. Use allowlist projectors and adversarial redaction tests.

## Migration Plan

1. Add nullable audit metadata and indexes.
2. Introduce policy, projector and unit-of-work ports with compatibility adapters.
3. Instrument and verify Floor, Ordering, Kitchen and Cash in that order.
4. Enable the missing-policy gate.
5. Backfill no historical payload; record a deployment marker defining the coverage boundary.

Rollback disables policy enforcement and restores the previous adapter while retaining append-only
records and additive columns.

