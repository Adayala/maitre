# Structure — SPEC-001

## Persistencia propuesta

```sql
create table tenants (
  id uuid primary key,
  name varchar(120) not null,
  status varchar(16) not null,
  default_locale varchar(35) not null,
  default_currency char(3) not null,
  default_timezone varchar(64) not null,
  contact_email varchar(320),
  contact_phone varchar(16),
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  constraint tenants_status_chk
    check (status in ('ACTIVE', 'SUSPENDED', 'ARCHIVED'))
);
```

Las foreign keys de actores se añaden sólo cuando el orden de migración y la política de borrado estén aprobados; la ausencia durante bootstrap se representa como actor de sistema en auditoría.

## Componentes

```text
domain/organization/tenant
application/organization/provision-tenant
application/organization/update-tenant
application/ports/tenant-repository
infrastructure/postgres/tenant-repository
infrastructure/postgres/outbox
presentation/http/organization
```

## Índices

- primary key por `id`;
- índice por `status` sólo si el plan de consultas lo justifica;
- no existe unique global sobre `contact_email`;
- cada tabla hija define índices compuestos comenzando por `tenant_id` según sus consultas.
