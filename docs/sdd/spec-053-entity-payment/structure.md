# Structure — SPEC-053

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  check_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(20),
  status VARCHAR(20) DEFAULT 'PENDING',
  external_transaction_id VARCHAR(255),
  processed_at TIMESTAMP,
  FOREIGN KEY(check_id) REFERENCES checks(id)
);
```
