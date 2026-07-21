# Structure — SPEC-027

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL UNIQUE,
  plan_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'TRIAL',
  billing_cycle VARCHAR(20),
  start_date TIMESTAMP,
  renewal_date TIMESTAMP,
  cancellation_date TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(plan_id) REFERENCES plans(id)
);
```
