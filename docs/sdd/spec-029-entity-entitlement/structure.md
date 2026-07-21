# Structure — SPEC-029

```sql
CREATE TABLE entitlements (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL,
  resource VARCHAR(50),
  soft_limit INT,
  hard_limit INT NOT NULL,
  override_reason TEXT,
  expires_at TIMESTAMP,
  UNIQUE(subscription_id, resource),
  FOREIGN KEY(subscription_id) REFERENCES subscriptions(id)
);
```
