# Structure — SPEC-017

## Database schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'INVITED',
  role VARCHAR(20),
  password_hash VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  UNIQUE(tenant_id, email),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id)
);
```
