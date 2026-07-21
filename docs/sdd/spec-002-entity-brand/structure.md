# Structure — SPEC-002

## Database schema

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  logo_url VARCHAR(2048),
  website VARCHAR(2048),
  default_menu_id UUID,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID,
  archived_at TIMESTAMP,
  archived_by UUID,
  UNIQUE(tenant_id, slug),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id),
  FOREIGN KEY(created_by) REFERENCES users(id),
  FOREIGN KEY(updated_by) REFERENCES users(id),
  FOREIGN KEY(archived_by) REFERENCES users(id)
);

CREATE INDEX idx_brands_tenant_id ON brands(tenant_id);
CREATE INDEX idx_brands_status ON brands(status);
```

## Fields detail

| Field | Type | Null | Unique | Notes |
| --- | --- | --- | --- | --- |
| id | UUID | ❌ | ✅ | PK, auto-generated |
| tenant_id | UUID | ❌ | (with slug) | FK to tenants |
| name | VARCHAR | ❌ | ❌ | 3-100 chars |
| slug | VARCHAR | ❌ | (with tenant) | normalized, unique per tenant |
| description | TEXT | ✅ | ❌ | 0-500 chars |
| status | VARCHAR | ❌ | ❌ | ACTIVE, INACTIVE, ARCHIVED |
| logo_url | VARCHAR | ✅ | ❌ | 2048 chars max |
| website | VARCHAR | ✅ | ❌ | 2048 chars max |
| default_menu_id | UUID | ✅ | ❌ | FK to menus (optional) |
| config | JSONB | ✅ | ❌ | { language, currency, policies } |
| created_at | TIMESTAMP | ❌ | ❌ | Immutable |
| created_by | UUID | ❌ | ❌ | FK to users |
| updated_at | TIMESTAMP | ❌ | ❌ | Auto-updated |
| updated_by | UUID | ❌ | ❌ | FK to users |
| archived_at | TIMESTAMP | ✅ | ❌ | Set on archive |
| archived_by | UUID | ✅ | ❌ | FK to users |

## Constraints

- `UNIQUE(tenant_id, slug)` — Slug is unique per tenant, not global
- `status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')`
- `name` length: 3-100
- `slug` normalized: lowercase, no spaces, alphanumeric + hyphen

## Config JSONB structure

```json
{
  "cancellation_policy": "string",
  "brand_voice": "string",
  "allergen_policy": "string",
  "language": "es | en | ...",
  "currency": "ARS | USD | ..."
}
```

## Migrations

**From Tenant to Brand:**
- When creating a brand, inherit tenant.language and tenant.currency as defaults

**Backward compatibility:**
- Brands can exist without a default_menu_id (null)
- Branches must handle nullable default_menu_id
