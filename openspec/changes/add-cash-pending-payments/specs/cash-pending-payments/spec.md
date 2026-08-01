## ADDED Requirements

### Requirement: Branch-scoped pending-check queue

Cash SHALL expose checks in `PAYMENT_PENDING` for the selected tenant and authorized branch,
including server-calculated balance, payment summary, visit context and table labels.

#### Scenario: Cashier opens the pending queue

- **WHEN** a cashier with `check:read` selects an authorized branch
- **THEN** Cash displays every persisted `PAYMENT_PENDING` check for that branch
- **AND** each item identifies its table, guests, currency and current balance

#### Scenario: Cashier targets an unauthorized branch

- **WHEN** a selected-branch cashier requests another branch's pending queue
- **THEN** the API returns the configured non-disclosing authorization response
- **AND** no check metadata is returned

### Requirement: Exact-balance manual payment

Cash SHALL create and capture a manual payment using the server-provided outstanding balance in
integer minor units, then settle the check when its balance reaches zero.

#### Scenario: Cashier records a cash payment

- **GIVEN** the check is `PAYMENT_PENDING` with a positive balance
- **AND** the selected register has an open compatible cash session
- **WHEN** the cashier confirms a `CASH` payment
- **THEN** exactly one payment is captured for the outstanding balance
- **AND** exactly one corresponding cash movement is recorded
- **AND** the check becomes `SETTLED` and disappears from the pending queue

#### Scenario: Cashier records a non-cash payment

- **WHEN** the cashier confirms a `CARD` or `OTHER` payment
- **THEN** the payment is captured and the balanced check is settled
- **AND** no cash movement is created

### Requirement: Idempotent and recoverable payment attempt

Every manual payment attempt SHALL use an idempotency key and SHALL recover safely when capture
succeeds but settlement confirmation is interrupted.

#### Scenario: Payment request is retried

- **WHEN** the same payment attempt is submitted more than once with its idempotency key
- **THEN** the existing payment is returned
- **AND** no duplicate captured payment or cash movement is created

#### Scenario: Captured check remains pending with zero balance

- **WHEN** Cash reloads a `PAYMENT_PENDING` check whose server-calculated balance is zero
- **THEN** Cash offers settlement recovery
- **AND** it does not create another payment

### Requirement: Accessible operational payment surface

Cash SHALL provide a named `Cobros pendientes` region with explicit loading, empty, error,
selection, confirmation and success states.

#### Scenario: Keyboard cashier completes payment

- **WHEN** the cashier navigates the pending queue and confirmation controls using a keyboard
- **THEN** focus order follows the visual workflow
- **AND** status changes are announced without relying on color or motion

#### Scenario: Cash session is unavailable

- **WHEN** the cashier selects `CASH` without an open compatible session
- **THEN** the confirmation action is disabled
- **AND** the UI explains that the cash session must be opened first
