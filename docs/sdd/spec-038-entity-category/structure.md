# Structure — SPEC-038

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  menu_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100),
  description TEXT,
  display_order INT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP,
  UNIQUE(menu_id, slug),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(brand_id) REFERENCES brands(id),
  FOREIGN KEY(menu_id) REFERENCES menus(id)
);
```
