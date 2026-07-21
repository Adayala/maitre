# Structure — SPEC-039

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  category_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100),
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'AVAILABLE',
  allergens JSONB,
  nutritional JSONB,
  display_order INT,
  created_at TIMESTAMP,
  UNIQUE(category_id, slug),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(category_id) REFERENCES categories(id)
);
```
