# Structure — SPEC-004

## Persistencia propuesta

```sql
create table branches (
  id uuid primary key,
  tenant_id uuid not null,
  brand_id uuid not null,
  fiscal_entity_id uuid,
  code varchar(32) not null,
  name varchar(120) not null,
  timezone varchar(64) not null,
  status varchar(16) not null,
  address_line1 varchar(160),
  address_line2 varchar(160),
  city varchar(100),
  subdivision varchar(100),
  postal_code varchar(24),
  country_code char(2),
  contact_email varchar(320),
  contact_phone varchar(16),
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  constraint branches_tenant_code_uq unique (tenant_id, code),
  constraint branches_tenant_id_uq unique (tenant_id, id),
  constraint branches_status_chk
    check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  constraint branches_code_chk
    check (code ~ '^[A-Z0-9][A-Z0-9_-]{0,31}$'),
  constraint branches_address_chk check (
    (address_line1 is null and city is null and country_code is null)
    or (address_line1 is not null and city is not null and country_code is not null)
  ),
  foreign key (tenant_id) references tenants(id),
  foreign key (tenant_id, brand_id) references brands(tenant_id, id),
  foreign key (tenant_id, fiscal_entity_id)
    references fiscal_entities(tenant_id, id)
);
```

Brand y FiscalEntity necesitan `unique (tenant_id, id)` para soportar las foreign keys compuestas. La migración final debe verificar compatibilidad con sus specs reconciliadas.

## Componentes

```text
domain/organization/branch
application/organization/create-branch
application/organization/change-branch-status
application/ports/branch-repository
infrastructure/postgres/branch-repository
infrastructure/postgres/outbox
```

No existen columnas `services_active`, `config` o `menu_id` en I0.
