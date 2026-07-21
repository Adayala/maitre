# Structure — SPEC-069

```sql
CREATE TABLE reservation_preferences (
  id UUID PRIMARY KEY,
  guest_id UUID NOT NULL UNIQUE,
  preferred_tables UUID[],
  preferred_times TIME[],
  allergies VARCHAR[],
  dietary_restrictions VARCHAR[],
  seating_preference VARCHAR(50),
  FOREIGN KEY(guest_id) REFERENCES guests(id)
);
```
