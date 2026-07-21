# Structure — SPEC-044

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  actor_id UUID,
  action VARCHAR(20),
  resource_type VARCHAR(100),
  resource_id UUID,
  previous_state JSONB,
  new_state JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX(tenant_id, timestamp)
);
```

Retention: 90 days default (configurable).
