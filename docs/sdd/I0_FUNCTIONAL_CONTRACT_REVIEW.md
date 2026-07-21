# I0 Functional Contract Review

**Fecha:** 2026-07-21

**Alcance:** SPEC-001 Tenant, SPEC-004 Branch, SPEC-017 User, SPEC-020 Membership y SPEC-023 Auth

**Resultado:** NOT READY — modelo de identidad, tenancy y entitlements requiere reconciliación

## Objetivo

Verificar que las entidades mínimas para `GET /v1/me/context` sean coherentes con Supabase Auth, multi-tenancy, memberships, RBAC y las specs transversales antes de crear migraciones o código.

## Resumen ejecutivo

Las cinco specs contienen material útil, pero fueron escritas bajo un modelo anterior y no forman todavía un contrato implementable conjunto.

Los principales problemas son:

- `User` mezcla identidad global, credenciales, tenant y autorización.
- `Membership` sólo admite un rol y no modela alcance por sucursal.
- `Tenant` duplica plan, features y cuotas que pertenecen a Subscription/Entitlement.
- `Branch` almacena `services_active`, duplicando entitlements efectivos.
- `Auth API` implementa login/password/JWT propios, mientras SPEC-210 propone Supabase Auth.
- `SPEC-001` conserva metadata, objective, structure y rules placeholder.

Implementar estas specs literalmente introduciría duplicación de fuentes de verdad y una migración temprana evitable.

## Findings

| ID | Severidad | Contrato | Finding | Decisión requerida |
| --- | --- | --- | --- | --- |
| FC-B01 | RESOLVED IN DRAFT | SPEC-017 | `User` contenía `tenantId`, `role` y `password_hash` | reconciliado como identidad global sin credenciales/autorización; pendiente review |
| FC-B02 | RESOLVED IN DRAFT | SPEC-020 | Membership modelaba un único `role` y no branches | reconciliado con role assignments y branch scopes normalizados; pendiente review |
| FC-B03 | RESOLVED IN DRAFT | SPEC-023 | Login/reset/verify y JWT propios contradecían Supabase Auth | reconciliado como boundary portable: proveedor gestiona credenciales/sesión y Maitre valida tokens y autoriza server-side; pendiente review/ADR |
| FC-B04 | RESOLVED IN DRAFT | SPEC-001 | `plan_tier`, límites y `features_enabled` duplicaban Subscription/Entitlement | retirados de Tenant; capacidades se resuelven en Subscription/Entitlement; pendiente review |
| FC-B05 | RESOLVED IN DRAFT | SPEC-004 | `services_active` duplicaba entitlements | retirado de Branch; capacidad efectiva derivada desde Entitlement; pendiente review |
| FC-B06 | RESOLVED IN DRAFT | SPEC-001 | README/objective/structure/rules eran placeholders | paquete completado y reconciliado; pendiente review |
| FC-B07 | RESOLVED IN DRAFT | SPEC-001/017 | `createdBy` obligatorio creaba ciclos durante bootstrap | actor system/null controlado y audit context definidos; pendiente review |
| FC-B08 | P1 | Todas | camelCase JSON y snake_case DB se mezclan sin mapping explícito | contratos camelCase; persistence snake_case detrás de repository |
| FC-B09 | P1 | SPEC-001/004/017/020 | timestamps SQL sin timezone | usar `timestamptz`, Clock y UTC según specs transversales |
| FC-B10 | P1 | SPEC-017/020 | unicidad de email por tenant contradice identidad multi-tenant | email/identity en proveedor/global; Membership permite mismo user en varios tenants |
| FC-B11 | P1 | SPEC-020 | UNIQUE tenant/user impide representar roles/branches si se modelan como filas | elegir Membership agregado + assignments o constraints compuestas explícitas |
| FC-B12 | RESOLVED IN DRAFT | SPEC-023 | `HS256 o RS256` quedaba ambiguo | allowlist explícita y validación de issuer/audience/JWKS definidas; pendiente spike/ADR |
| FC-B13 | RESOLVED IN DRAFT | SPEC-001 | trial/cancel por job estaba acoplado a billing | estado comercial delegado a Subscription y lifecycle organizacional separado; pendiente review |
| FC-B14 | RESOLVED IN DRAFT | SPEC-004 | herencia de menú/config no estaba definida ni era necesaria para I0 | retirada del agregado mínimo y delegada a specs de dominio posteriores; pendiente review |
| FC-B15 | P1 | Todas | criterios marcan ✅ aunque status es PLANNED | checkboxes representan evidencia, no intención |

## Modelo objetivo para I0

```text
Supabase auth.users
  └── external identity id
       ↓
Maitre User (global profile/status)
  └── Membership (User ↔ Tenant, status)
       ├── RoleAssignment(s)
       └── BranchScope(s)

Tenant
  ├── Brand
  └── Branch

Subscription/Entitlement
  └── effective capabilities by tenant/branch
```

## Responsabilidades propuestas

### SPEC-001 Tenant

Mantener:

- ID, nombre, estado organizacional y defaults de locale/timezone/currency;
- audit metadata y lifecycle organizacional;
- raíz de aislamiento.

Retirar/delegar:

- plan tier, expiración, features y cuotas → SPEC-027–035;
- revenue/employee count → fuera de I0 hasta propósito aprobado;
- trial automático → Subscription lifecycle.

### SPEC-004 Branch

Mantener:

- tenant, brand, fiscal entity opcional, code, name, timezone y status;
- dirección estructurada sólo si I0 la necesita;
- constraints tenant-scoped.

Retirar/delegar:

- `services_active` → entitlement calculation;
- menu inheritance/config extensa → Catalog/decision posterior;
- strings/arrays libres como autorización.

### SPEC-017 User

Mantener:

- ID de dominio global;
- `externalIdentityId` único;
- display name y estado local;
- timestamps/audit mínimos.

Retirar/delegar:

- password/hash/verification → Supabase Auth;
- tenant y role → Membership/RoleAssignment;
- email autoritativo duplicado, salvo snapshot/contacto con política explícita.

### SPEC-020 Membership

Definir:

- vínculo único User ↔ Tenant;
- status `INVITED | ACTIVE | SUSPENDED | REVOKED` o set aprobado;
- roles/assignments con constraints;
- alcance all-branches o branch IDs explícitos;
- invitación, activación, revocación y última-owner protection;
- autorización no derivada de claims editables por cliente.

### SPEC-023 Auth

Para la opción Supabase propuesta:

- browser usa SDK Auth para login/refresh/logout permitidos;
- API valida access token mediante issuer/audience/JWKS/config;
- backend resuelve User/Membership en `GET /v1/me/context`;
- reset/verify/MFA siguen flows soportados del proveedor y redirect allowlist;
- Maitre no almacena password/hash ni emite un segundo JWT de sesión sin necesidad.

## Contrato mínimo de `/v1/me/context`

Response propuesta, sujeta a schemas SPEC-213/215:

```json
{
  "data": {
    "user": {
      "id": "user_...",
      "displayName": "Alex Demo"
    },
    "memberships": [
      {
        "tenant": {
          "id": "tenant_...",
          "name": "Restaurante Demo"
        },
        "roles": ["OWNER"],
        "branches": [
          {
            "id": "branch_...",
            "name": "Sucursal Demo",
            "timezone": "America/Argentina/Buenos_Aires"
          }
        ]
      }
    ]
  },
  "meta": {
    "correlationId": "01J..."
  }
}
```

No incluir en I0:

- tokens/refresh tokens en esta response;
- permisos completos si roles/entitlements pueden resolverse server-side;
- datos fiscales o secretos;
- branches fuera del alcance efectivo;
- claims del proveedor sin mapping al dominio.

## Orden de reconciliación

1. Aprobar/rechazar ADR-002 Supabase.
2. Reescribir SPEC-017 User sin credenciales/tenant/role.
3. Reescribir SPEC-020 Membership y decidir role/branch assignments.
4. Reescribir SPEC-023 como Auth boundary y session flows.
5. Recortar SPEC-001 Tenant y completar placeholders.
6. Recortar SPEC-004 Branch y eliminar services duplicados.
7. Alinear SPEC-213 `/v1/me/context` y schemas API.
8. Añadir tests Tenant A/B, membership revocada y branch fuera de scope.

## Criterios para cerrar FC-B01–B15

- Una única fuente de verdad para credenciales, identidad, roles, scopes y entitlements.
- Ninguna tabla operacional/auth usa un tenant implícito o rol dentro de User.
- Los cinco paquetes poseen metadata y criterios sin placeholders/✅ anticipados.
- APIs y DB distinguen contratos camelCase de columnas snake_case.
- Bootstrap inicial no viola foreign keys/auditoría.
- Tests negativos demuestran que un token válido no amplía tenant/branch.
- SPEC-001/004/017/020/023 pueden pasar a `IN_REVIEW` como conjunto coherente.
