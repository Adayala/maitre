# Estructura — SPEC-003

> **Estado:** antecedente no implementable. No se deben crear certificados ni almacenar claves
> desde este SQL. El baseline reconciliado está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitrefiscal_entities--spec-003)
> y continúa pendiente de sign-off en OPEN-003.

## Persistencia propuesta

```sql
create table fiscal_entities (
  id uuid primary key,
  tenant_id uuid not null,
  cuit varchar(11) not null,
  legal_name varchar(200) not null,
  tax_condition varchar(32) not null,
  status varchar(16) not null,
  active_certificate_ref varchar(255),
  certificate_valid_from timestamptz,
  certificate_valid_to timestamptz,
  arca_authorized_at timestamptz,
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  constraint fiscal_entities_tenant_cuit_uq unique (tenant_id, cuit),
  constraint fiscal_entities_tenant_id_uq unique (tenant_id, id),
  constraint fiscal_entities_status_chk
    check (status in ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  foreign key (tenant_id) references tenants(id)
);
```

Los certificados históricos o detalles extensos de criptografía se almacenan en recursos auxiliares o almacenes seguros aprobados; no se materializan como secreto reutilizable en la tabla principal.

## Componentes

```text
domain/organization/fiscal-entity
application/organization/register-fiscal-entity
application/organization/rotate-fiscal-certificate
application/ports/fiscal-entity-repository
infrastructure/postgres/fiscal-entity-repository
infrastructure/postgres/outbox
```

## Índices

- primary key por `id`;
- unique compuesto `(tenant_id, cuit)`;
- índice por vencimiento de certificado si las consultas operativas lo requieren;
- índices para relaciones same-tenant con Branch y FiscalPoint al reconciliar sus specs.
