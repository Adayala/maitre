# Structure — SPEC-049

```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  reservation_id UUID,
  status VARCHAR(20) DEFAULT 'OPEN',
  guest_count INT,
  primary_guest_id UUID,
  table_ids UUID[] NOT NULL,
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  estimated_duration INT,
  notes TEXT,
  INDEX(tenant_id, branch_id, status),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(branch_id) REFERENCES branches(id),
  FOREIGN KEY(reservation_id) REFERENCES reservations(id)
);
```
