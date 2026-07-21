# Estructura — SPEC-020

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

## Constraints que requieren transacción

- ACTIVE tiene al menos un role assignment.
- SELECTED_BRANCHES tiene al menos un scope.
- Cada scoped branch pertenece al mismo tenant.
- ALL_BRANCHES no conserva scope rows.
- El tenant mantiene al menos un OWNER activo salvo cierre controlado.

Estas invariantes no se resuelven con un `UNIQUE` aislado; el caso de uso usa transaction/locking y tests de concurrencia.
