# Structure — SPEC-054

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  branch_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  applicable_to VARCHAR(50)[],
  status VARCHAR(20) DEFAULT 'ACTIVE',
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);
```
