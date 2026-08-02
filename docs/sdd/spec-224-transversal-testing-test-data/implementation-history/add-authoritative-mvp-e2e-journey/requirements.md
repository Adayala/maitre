> Historial de implementación migrado al árbol SDD; SPEC-224 es la fuente normativa vigente.

## ADDED Requirements

### Requirement: Real cross-application MVP journey

The release E2E suite MUST complete the authoritative table, order, kitchen, delivery, bill,
manual payment and visit-close journey through production frontend builds and the real API
composition sharing one persistence state.

#### Scenario: Complete restaurant operation

- **WHEN** waiter, kitchen and cashier users perform their assigned steps through their respective
  applications
- **THEN** the visit closes with one settled check, one exact-balance captured payment and the
  corresponding cash movement
- **AND** the table becomes available with no duplicated order, command or payment

### Requirement: No product API simulation in release journey

The authoritative journey MUST NOT fulfill, rewrite or abort Maitre product API requests in the
browser. External integrations MAY use server-side contract fakes explicitly selected for E2E.

#### Scenario: Browser response fulfillment is introduced

- **WHEN** the authoritative journey registers a product API route handler that fulfills or
  changes a response
- **THEN** the E2E policy gate fails
- **AND** the test cannot count as release evidence

### Requirement: Deterministic isolated provisioning

Every run SHALL use a recorded run ID, seed, business clock and namespaced synthetic resources for
Tenant A and Tenant B. Role fixture authority MUST be available only in E2E and cleanup MUST be
idempotent and verified.

#### Scenario: Replay a failed run

- **WHEN** the reported commit, seed and profile are used again
- **THEN** provisioning creates an equivalent baseline and role capabilities
- **AND** the same product behavior can be reproduced without remote mutable test data

#### Scenario: E2E controls in a shared environment

- **WHEN** fixture identity or provisioning controls are enabled outside the guarded E2E
  environment
- **THEN** application startup fails closed

### Requirement: Observable state and monetary assertions

The journey MUST assert user-visible transitions and black-box API state for visit, table, order,
kitchen command, check, payment and cash movement. Monetary assertions MUST use integer minor
units and prove paid amount, balance and movement agree.

#### Scenario: UI reports success without persisted settlement

- **WHEN** Cash displays payment success but the payment is not captured or the check balance is
  non-zero
- **THEN** the journey fails with the last API state and correlation evidence

### Requirement: Cross-tenant negative evidence

The journey SHALL prove that a Tenant B principal cannot read or mutate a representative Tenant A
resource created by the run.

#### Scenario: Tenant B targets Tenant A visit

- **WHEN** the Tenant B principal requests or mutates the Tenant A visit identifier
- **THEN** the API returns the configured non-disclosing authorization/not-found response
- **AND** Tenant A state remains unchanged

### Requirement: Fail-closed release evidence

The release gate MUST fail on product failure, infrastructure failure, prohibited skip/fixme/only,
cleanup failure or missing required artifacts. Retries MAY collect diagnostics but MUST NOT
convert the initial failure into clean approval.

#### Scenario: Required application cannot start

- **WHEN** API, Floor, Kitchen, Cash or ephemeral persistence does not become ready
- **THEN** the run is classified `INFRA_ERROR`
- **AND** deployment is blocked with reproducible startup diagnostics
