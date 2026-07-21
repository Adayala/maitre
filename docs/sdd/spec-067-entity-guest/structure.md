# Structure — SPEC-067

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(200),
  phone VARCHAR(20),
  email VARCHAR(255),
  preferences JSONB,
  notes TEXT,
  total_visits INT DEFAULT 0,
  created_at TIMESTAMP,
  INDEX(tenant_id, email),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id)
);
```
