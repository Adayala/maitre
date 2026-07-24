# Estructura — SPEC-005

> **Estado:** antecedente no implementable. El baseline físico reconciliado está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitresalons--spec-005)
> y la semántica de capacidad continúa pendiente de sign-off en OPEN-005.

## Persistencia propuesta

```sql
create table salons (
  id uuid primary key,
  tenant_id uuid not null,
  branch_id uuid not null,
  code varchar(32),
  name varchar(120) not null,
  description text,
  max_capacity integer,
  display_order integer,
  status varchar(16) not null,
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  constraint salons_tenant_branch_name_uq unique (tenant_id, branch_id, name),
  constraint salons_status_chk
    check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  foreign key (tenant_id, branch_id) references branches(tenant_id, id)
);
```

La unicidad por `code` queda opcional hasta definir si el negocio lo requiere además de `name`.

## Componentes

```text
domain/organization/salon
application/organization/create-salon
application/organization/reorder-salon
application/ports/salon-repository
infrastructure/postgres/salon-repository
```
