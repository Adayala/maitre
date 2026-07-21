# Structure — SPEC-030

```sql
CREATE TABLE quotas (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL,
  resource VARCHAR(50),
  used INT DEFAULT 0,
  entitlement_id UUID,
  last_updated_at TIMESTAMP,
  UNIQUE(subscription_id, resource),
  FOREIGN KEY(subscription_id) REFERENCES subscriptions(id),
  FOREIGN KEY(entitlement_id) REFERENCES entitlements(id)
);
```
