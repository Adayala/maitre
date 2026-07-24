# Estructura — SPEC-017

> **Estado:** antecedente no implementable. El baseline físico reconciliado está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitreusers--spec-017)
> y su lifecycle continúa pendiente de sign-off en OPEN-017.

## Persistencia lógica

```sql
create table identity_users (
  id uuid primary key,
  identity_provider text not null,
  external_identity_id text not null,
  display_name text not null,
  email text,
  status text not null,
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  suspended_at timestamptz,
  deactivated_at timestamptz,
  unique (identity_provider, external_identity_id)
);
```

El SQL es estructura lógica para review; la migración final define checks, FKs, grants y RLS conforme SPEC-210/219.

## Mapping

| Contrato/dominio | PostgreSQL |
| --- | --- |
| `externalIdentityId` | `external_identity_id` |
| `displayName` | `display_name` |
| `createdAt` | `created_at` |
| `deactivatedAt` | `deactivated_at` |

DTOs/API usan camelCase. Columnas usan snake_case únicamente dentro del adapter de persistencia.

## Índices

- unique provider + external identity;
- status sólo si una query medida lo requiere;
- email no recibe unique tenant-scoped.
