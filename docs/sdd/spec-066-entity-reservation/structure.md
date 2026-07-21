# Structure — SPEC-066

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  reservation_time TIMESTAMP NOT NULL,
  party_size INT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  preferences JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(tenant_id, branch_id, reservation_time),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(branch_id) REFERENCES branches(id),
  FOREIGN KEY(guest_id) REFERENCES guests(id)
);
```
