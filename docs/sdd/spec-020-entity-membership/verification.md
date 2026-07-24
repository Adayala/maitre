# Verificación — SPEC-020

## Criterios

### CAD-020-01 — Membership es el vínculo único User ↔ Tenant

- [ ] segundo vínculo User/Tenant duplicado es rechazado;
- [ ] el vínculo concentra la autorización con alcance tenant;
- [ ] User y Tenant no absorben esa responsabilidad.

### CAD-020-02 — Membership activa requiere roles explícitos y válidos

- [ ] ACTIVE sin roles es rechazado;
- [ ] role sin permission o entitlement no autoriza acción;
- [ ] los roles referencian catálogo válido.

### CAD-020-03 — El alcance por sucursal es explícito y consistente

- [ ] SELECTED_BRANCHES vacío o cross-tenant es rechazado;
- [ ] ALL_BRANCHES no conserva alcances redundantes;
- [ ] `/v1/me/context` devuelve sólo roles/sucursales autorizados.

### CAD-020-04 — Revocar o suspender Membership corta acceso efectivo

- [ ] Membership SUSPENDED/REVOKED no aparece como contexto activo;
- [ ] token/header con sucursal ajena no amplía acceso;
- [ ] User/Tenant/Branch inactivos bloquean contexto efectivo.

### CAD-020-05 — Membership aplica mínimo privilegio y aislamiento verificable

- [ ] RLS y repository bloquean lectura/escritura cross-tenant;
- [ ] tenant o sucursal fuera de alcance permanecen bloqueados;
- [ ] headers/selectores del cliente no amplían permisos.

### CAD-020-06 — Cambios de roles/alcances conservan auditoría y protegen al último OWNER

- [ ] dos revocaciones concurrentes no eliminan el último OWNER;
- [ ] cambios guardan actor, timestamp y resultado auditable;
- [ ] transferencias/cierres protegidos requieren workflow aprobado.
