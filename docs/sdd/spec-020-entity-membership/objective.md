# Objetivo — SPEC-020

## Propósito

Resolver qué puede hacer un User dentro de un tenant y en qué sucursales, conservando revocación, mínimo privilegio y aislamiento verificable.

## Resultados esperados

- Un User participa en uno o más tenants sin duplicar identidad.
- Membership activa posee roles explícitos.
- El alcance es todas las sucursales o un conjunto explícito.
- Revocar/suspender Membership elimina acceso al tenant.
- Cambios de roles/alcances son auditables y no dependen del token del cliente.

## No objetivos

- Almacenar credenciales o perfil global.
- Definir el catálogo completo de permisos/entitlements.
- Modelar asignaciones operativas por jornada/plaza.

## Criterios de aceptación

### CAD-020-01 — Membership es el vínculo único User ↔ Tenant

Existe como máximo una Membership por combinación User/Tenant. User y Tenant permanecen separados y el vínculo concentra la autorización con alcance tenant.

### CAD-020-02 — Membership activa requiere roles explícitos y válidos

Una Membership `ACTIVE` tiene al menos un role assignment válido. Los roles referencian catálogo aprobado y no se derivan de claims del cliente.

### CAD-020-03 — El alcance por sucursal es explícito y consistente

`SELECTED_BRANCHES` exige alcances no vacíos y tenant-consistentes. `ALL_BRANCHES` no usa filas redundantes como segunda fuente de verdad.

### CAD-020-04 — Revocar o suspender Membership corta acceso efectivo

Membership `SUSPENDED` o `REVOKED` deja de autorizar contexto en el siguiente request, aun si el token externo sigue siendo válido.

### CAD-020-05 — Membership aplica mínimo privilegio y aislamiento verificable

Un actor sólo obtiene acceso a tenant y sucursales dentro de su alcance efectivo. Headers, selectors o claims del cliente no amplían autoridad.

### CAD-020-06 — Cambios de roles/alcances conservan auditoría y protegen al último OWNER

Cambios de roles o scopes registran actor, timestamp y resultado. No se puede revocar al último OWNER activo sin transferencia o cierre aprobado.
