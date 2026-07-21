# Structure — SPEC-004

## Database schema

```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  fiscal_entity_id UUID,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  timezone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  services_active TEXT[] (array of service codes),
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID,
  UNIQUE(tenant_id, code),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(brand_id) REFERENCES brands(id),
  FOREIGN KEY(fiscal_entity_id) REFERENCES fiscal_entities(id)
);
```
