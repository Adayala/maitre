# Especificación — SPEC-017

## Modelo

```json
{
  "id": "uuid",
  "identityProvider": "string",
  "externalIdentityId": "string",
  "displayName": "string",
  "email": "string | null",
  "status": "ACTIVE | SUSPENDED | DEACTIVATED",
  "createdAt": "RFC3339 timestamp",
  "createdBy": "actor id | null",
  "updatedAt": "RFC3339 timestamp",
  "updatedBy": "actor id | null",
  "suspendedAt": "RFC3339 timestamp | null",
  "deactivatedAt": "RFC3339 timestamp | null"
}
```

## Campos

| Campo | Regla |
| --- | --- |
| `id` | ID de dominio global, opaco e inmutable |
| `identityProvider` | key del adapter, no nombre visible ni secreto |
| `externalIdentityId` | subject estable entregado por el proveedor |
| `displayName` | 1–100 caracteres luego de trim |
| `email` | snapshot normalizado opcional para contacto/UI; no concede acceso |
| `status` | estado global del perfil en Maitre |
| audit fields | UTC; actor nullable únicamente para provisioning de sistema controlado |

## Estados

```text
ACTIVE ↔ SUSPENDED
ACTIVE/SUSPENDED → DEACTIVATED
```

- `ACTIVE`: elegible para resolver memberships activas.
- `SUSPENDED`: bloqueo reversible de acceso global.
- `DEACTIVATED`: bloqueo terminal para nuevas operaciones; historial preservado.

Reactivar un User `DEACTIVATED` requiere una decisión futura; no está permitido en I0.

## Identidad externa

- El API verifica el token mediante `SessionVerificationPort`.
- El adapter entrega provider key + subject validado.
- El repositorio resuelve User por esa tupla.
- Claims como role, tenant o branch no actualizan autorización del dominio.
- Cambiar email del proveedor no crea otro User si el subject permanece estable.

## Email

Email es PII y snapshot de conveniencia:

- se normaliza para almacenamiento/display según política;
- no es lookup autoritativo de sesión;
- no se usa como tenant key o permission;
- su unicidad pertenece al proveedor/política de linking, no a cada tenant;
- divergencia se sincroniza mediante flujo explícito, no durante cualquier request.

## Provisioning

I0 admite provisioning controlado de usuarios sintéticos. Invitación pública/por email se define con SPEC-021/023/024; no se implementa dentro de la entidad.
