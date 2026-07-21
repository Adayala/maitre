# Contrato — SPEC-020 Membership

## Responsabilidad

Membership vincula un User global con un Tenant y es la raíz de autorización tenant-scoped.
Roles y branch scopes son assignments normalizados/versionados; no arrays confiados al
cliente ni datos almacenados en User.

## Campos y lifecycle

Campos: id, tenantId, userId, status `INVITED | ACTIVE | SUSPENDED | REVOKED`, role
assignments, branch scopes, invitation reference, version y auditoría.

```text
INVITED → ACTIVE → SUSPENDED → ACTIVE
                    └───────→ REVOKED
INVITED ────────────────────→ REVOKED
```

`REVOKED` es terminal. Un par tenant/user tiene como máximo una membership no terminal;
reinvitar resuelve/reusa estado mediante workflow idempotente.

## Invariantes

1. User y Tenant existen y están habilitados.
2. Roles/permissions pertenecen al catálogo y scopes a Branches del mismo tenant.
3. Debe quedar al menos un OWNER activo; transferencia usa command concurrente/auditado.
4. Actor no delega capacidades/scopes superiores a los propios.
5. Suspensión/revocación surte efecto server-side sin esperar claims nuevos.
6. Cambios privilegiados registran actor, target, motivo y diff.

## Aceptación

Tests cubren invitación concurrente, aceptación, last owner, self-grant, branch scope,
revocación inmediata, cross-tenant y optimistic concurrency.
