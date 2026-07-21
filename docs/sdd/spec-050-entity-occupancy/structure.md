# Structure — SPEC-050

```sql
CREATE TABLE occupancies (
  id UUID PRIMARY KEY,
  visit_id UUID NOT NULL,
  table_id UUID NOT NULL,
  seated_at TIMESTAMP,
  occupied_seats INT NOT NULL,
  capacity INT NOT NULL,
  UNIQUE(visit_id, table_id),
  FOREIGN KEY(visit_id) REFERENCES visits(id),
  FOREIGN KEY(table_id) REFERENCES tables(id)
);
```
