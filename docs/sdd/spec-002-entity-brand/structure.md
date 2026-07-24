# Estructura — SPEC-002

> **Estado:** antecedente no implementable. El baseline físico reconciliado está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitrebrands--spec-002)
> y la separación de configuración continúa pendiente de sign-off en OPEN-002.

## Persistencia propuesta

```sql
create table brands (
  id uuid primary key,
  tenant_id uuid not null,
  name varchar(120) not null,
  slug varchar(120) not null,
  description text,
  status varchar(16) not null,
  logo_asset_id uuid,
  website_url varchar(2048),
  voice_profile varchar(64),
  cancellation_policy_summary text,
  allergen_policy_summary text,
  default_menu_id uuid,
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  constraint brands_tenant_slug_uq unique (tenant_id, slug),
  constraint brands_tenant_id_uq unique (tenant_id, id),
  constraint brands_status_chk
    check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  foreign key (tenant_id) references tenants(id)
);
```

`default_menu_id` sólo puede activarse cuando Menu quede aprobado como referencia same-tenant; mientras tanto se mantiene como contrato pendiente y no como mandato de implementación inmediata.

## Componentes

```text
domain/organization/brand
application/organization/create-brand
application/organization/update-brand
application/ports/brand-repository
infrastructure/postgres/brand-repository
infrastructure/postgres/outbox
```

## Índices

- primary key por `id`;
- unique compuesto `(tenant_id, slug)`;
- índice por `(tenant_id, status)` si el plan de consultas lo justifica;
- no existe índice funcional para un `config` libre porque ese contenedor queda fuera de contrato.
