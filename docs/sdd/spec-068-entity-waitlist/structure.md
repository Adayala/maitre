# Structure — SPEC-068

```sql
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY,
  branch_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  party_size INT NOT NULL,
  status VARCHAR(20) DEFAULT 'WAITING',
  arrived_at TIMESTAMP,
  seated_at TIMESTAMP,
  estimated_wait INT,
  FOREIGN KEY(branch_id) REFERENCES branches(id),
  FOREIGN KEY(guest_id) REFERENCES guests(id)
);
```
