# Structure — SPEC-005

## Schema
```sql
CREATE TABLE salons (
  id UUID PRIMARY KEY,
  branch_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  capacity INTEGER,
  description TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP,
  FOREIGN KEY(branch_id) REFERENCES branches(id)
);
```
