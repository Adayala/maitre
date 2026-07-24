# Estructura — SPEC-020

> **Estado:** antecedente no implementable. El baseline físico reconciliado está en
> [SPEC-210 — diccionario I0](../spec-210-transversal-data-identity-platform/i0-physical-dictionary.md#maitrememberships--spec-020)
> y su unicidad continúa pendiente de sign-off en OPEN-020.

## Persistencia lógica

```sql
create table memberships (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  user_id uuid not null references identity_users(id),
  status text not null,
  branch_scope_type text not null,
  invited_at timestamptz,
  activated_at timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null,
  created_by uuid,
  updated_at timestamptz not null,
  updated_by uuid,
  unique (tenant_id, user_id)
);

create table membership_role_assignments (
  membership_id uuid not null references memberships(id),
  role_id text not null,
  created_at timestamptz not null,
  created_by uuid,
  primary key (membership_id, role_id)
);

create table membership_branch_scopes (
  membership_id uuid not null references memberships(id),
  branch_id uuid not null references branches(id),
  created_at timestamptz not null,
  created_by uuid,
  primary key (membership_id, branch_id)
);
```

El SQL es lógico. Migraciones finales agregan checks, FK/tenant consistency, grants, RLS e índices según SPEC-210/219.

## Restricciones que requieren transacción

- ACTIVE tiene al menos un role assignment.
- SELECTED_BRANCHES tiene al menos un alcance.
- Cada sucursal con alcance pertenece al mismo tenant.
- ALL_BRANCHES no conserva filas de alcance.
- El tenant mantiene al menos un OWNER activo salvo cierre controlado.

Estas invariantes no se resuelven con un `UNIQUE` aislado; el caso de uso usa transacción/locking y tests de concurrencia.
