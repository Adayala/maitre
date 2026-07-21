# Structure — SPEC-070

```sql
CREATE TABLE cancellation_policies (
  id UUID PRIMARY KEY,
  branch_id UUID NOT NULL UNIQUE,
  hours_before_cancel INT DEFAULT 24,
  penalty_percentage DECIMAL(3,2),
  refundable BOOLEAN DEFAULT TRUE,
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);
```
