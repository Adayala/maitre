# Structure — SPEC-028

```sql
CREATE TABLE subscription_items (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL,
  service_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  quantity INT DEFAULT 1,
  unit_price DECIMAL,
  activated_at TIMESTAMP,
  deactivated_at TIMESTAMP,
  UNIQUE(subscription_id, service_id),
  FOREIGN KEY(subscription_id) REFERENCES subscriptions(id),
  FOREIGN KEY(service_id) REFERENCES services(id)
);
```
