# Verificación — SPEC-020

- [ ] Segundo vínculo User/Tenant duplicado es rechazado.
- [ ] ACTIVE sin roles es rechazado.
- [ ] SELECTED_BRANCHES vacío o cross-tenant es rechazado.
- [ ] ALL_BRANCHES no conserva scopes redundantes.
- [ ] Token/header con branch ajena no amplía acceso.
- [ ] Membership SUSPENDED/REVOKED no aparece como contexto activo.
- [ ] User/Tenant/Branch inactivos bloquean contexto efectivo.
- [ ] Role sin permission o entitlement no autoriza acción.
- [ ] Dos revocaciones concurrentes no eliminan el último OWNER.
- [ ] Cambios guardan actor, timestamp y resultado auditable.
- [ ] RLS y repository bloquean lectura/escritura cross-tenant.
- [ ] `/v1/me/context` devuelve sólo roles/branches autorizados.
