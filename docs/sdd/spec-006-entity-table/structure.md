# Estructura — SPEC-006

> **Estado:** antecedente no implementable. El baseline físico propuesto está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitredining_tables--spec-006)
> y continúa pendiente de sign-off en OPEN-006.

## Persistencia propuesta

```sql
create table dining_tables (
  id uuid primary key,
  tenant_id uuid not null,
  branch_id uuid not null,
  salon_id uuid not null,
  number varchar(32) not null,
  display_name varchar(120),
  capacity integer not null,
  shape varchar(24),
  zone varchar(64),
  pos_x numeric(8,2),
  pos_y numeric(8,2),
  is_accessible boolean,
  status_override varchar(16),
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  constraint dining_tables_tenant_salon_number_uq
    unique (tenant_id, salon_id, number),
  constraint dining_tables_capacity_chk
    check (capacity > 0),
  constraint dining_tables_status_override_chk
    check (status_override in ('NONE', 'BLOCKED') or status_override is null),
  foreign key (tenant_id, branch_id) references branches(tenant_id, id),
  foreign key (tenant_id, salon_id) references salons(tenant_id, id)
);
```

`status_override` no representa el estado operativo completo de la mesa: sólo admite bloqueos administrativos explícitos o ausencia de override. El estado visible final sigue siendo derivado.

## Componentes

```text
domain/organization/table
application/organization/create-table
application/organization/move-table
application/organization/block-table
application/ports/table-repository
infrastructure/postgres/table-repository
projection/floor-state/table-status
```
