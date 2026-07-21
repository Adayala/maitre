# Structure — SPEC-037

```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  is_default BOOLEAN DEFAULT FALSE,
  display_order INT,
  created_at TIMESTAMP,
  created_by UUID,
  UNIQUE(brand_id, slug),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(brand_id) REFERENCES brands(id)
);
```
