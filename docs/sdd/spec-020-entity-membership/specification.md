# Especificación — SPEC-020

## Agregado

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "userId": "uuid",
  "status": "INVITED | ACTIVE | SUSPENDED | REVOKED",
  "branchScopeType": "ALL_BRANCHES | SELECTED_BRANCHES",
  "roleIds": ["role_owner"],
  "branchIds": ["branch_..."],
  "invitedAt": "RFC3339 | null",
  "activatedAt": "RFC3339 | null",
  "suspendedAt": "RFC3339 | null",
  "revokedAt": "RFC3339 | null",
  "createdAt": "RFC3339",
  "createdBy": "actor id | null",
  "updatedAt": "RFC3339",
  "updatedBy": "actor id | null"
}
```

`roleIds` y `branchIds` son representación del agregado/DTO. Persistencia usa tablas normalizadas.

## Estados

```text
INVITED → ACTIVE ↔ SUSPENDED → REVOKED
INVITED → REVOKED
ACTIVE → REVOKED
```

- `INVITED`: vínculo preparado pero no habilita sesión operativa.
- `ACTIVE`: elegible para roles/alcances efectivos.
- `SUSPENDED`: bloqueo reversible dentro del tenant.
- `REVOKED`: terminal; preserva historia y no concede acceso.

## Roles

- Roles referencian SPEC-018 y se resuelven a permisos mediante SPEC-019/026.
- Membership ACTIVE requiere uno o más roles.
- Un assignment no contiene permisos copiados.
- Roles desconocidos/inactivos no se ignoran: invalidan el cambio.
- `GUEST` no se asigna como rol interno en I0; Guest posee su propio modelo público/sesión.

## Alcance de sucursales

### ALL_BRANCHES

- Acceso potencial a todas las sucursales activas del tenant, sujeto a rol/permiso/entitlement.
- No se mantienen filas redundantes de alcance por sucursal.
- Una sucursal nueva entra al alcance, pero no activa un servicio sin entitlement.

### SELECTED_BRANCHES

- Requiere al menos una sucursal activa del mismo tenant.
- `branchIds` de otro tenant son rechazados.
- Remover el último alcance exige cambiar tipo, suspender o revocar Membership.

El alcance por sucursal limita dónde puede actuar; no significa asignación a plaza/turno/estación.

## Contexto efectivo

```text
User ACTIVE
  + Membership ACTIVE
  + RoleAssignment
  + BranchScope
  + Tenant/Branch ACTIVE
  + Permission
  + Entitlement
  = acción autorizada
```

El servidor calcula este contexto. Un token/header solicita contexto, pero no agrega roles o
sucursales.

## Invitación

I0 puede provisionar Memberships sintéticas. El flujo de invitación real coordina proveedor de identidad, User y Membership mediante SPEC-021/023/024. Reenviar/expirar invitaciones no se modela como mutación libre de esta entidad.
