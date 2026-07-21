# Structure — SPEC-052

```sql
CREATE TABLE checks (
  id UUID PRIMARY KEY,
  visit_id UUID NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'OPEN',
  subtotal DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  finalized_at TIMESTAMP,
  paid_at TIMESTAMP,
  FOREIGN KEY(visit_id) REFERENCES visits(id)
);
```
