# Especificación — SPEC-016 Organization RBAC

## Permisos canónicos

`tenant.read/update`, `brand.read/create/update/archive`, `fiscal_entity.read/create/update`,
`branch.read/create/update/archive`, `salon.manage`, `table.manage` y `organization.audit.read`.

OWNER/ADMIN reciben assignments versionados según política. MANAGER sólo recibe permisos concretos y
alcances por sucursal; no existe herencia implícita por “nivel”. Roles funcionales como
WAITER/COOK/CASHIER no tienen acceso Organization salvo permiso explícito mínimo.

Crear Tenant pertenece al control-plane/onboarding, no a un actor que ya elige tenant desde el body.
FiscalEntity y cambios sensibles requieren permiso separado, motivo/auditoría y eventualmente step-up.

La autorización valida autenticación, Membership ACTIVE, permiso, tenant, alcance por sucursal y reglas
de dominio. Deny-by-default; claims/headers seleccionan contexto pero no conceden autoridad.
