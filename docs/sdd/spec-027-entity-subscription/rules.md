# Rules — SPEC-027

## Invariantes

### 1. One subscription per tenant
UNIQUE(tenant_id).

### 2. Status transitions
TRIAL → ACTIVE → SUSPENDED → CANCELLED (irreversible)

### 3. Renewal logic
If autoRenew && today >= renewalDate, auto-renew to next period.

### 4. Cancellation
Cancellation is immediate; can not resume same subscription.
