# Objetivo — SPEC-026

## Propósito

Autorizar acciones de identidad mediante permisos, Membership activa y alcances server-side,
impidiendo self-escalation, delegación superior y eliminación del último OWNER.

## Criterios de aceptación

### CAD-026-01 — Cada acción resuelve User, Membership ACTIVE, permiso y alcance autoritativos

Cada acción resuelve User, Membership ACTIVE, permiso y alcance tenant/sucursal; un claim o selector
de tenant nunca prueba autoridad.

### CAD-026-02 — OWNER, ADMIN y MANAGER cumplen la matriz contractual sin jerarquía ordinal implícita

OWNER/ADMIN/MANAGER cumplen la matriz contractual sin asumir jerarquía ordinal ni wildcard “full
control”.

### CAD-026-03 — Un actor no se asigna roles o alcances ni delega capabilities ausentes

Un actor no se asigna roles/alcances, no delega capabilities ausentes/no delegables y ADMIN no modifica
OWNER o peer protegido.

### CAD-026-04 — Siempre permanece al menos un OWNER activo

Siempre permanece al menos un OWNER activo; transferencia/cierre usa workflow explícito, concurrencia
y auditoría.

### CAD-026-05 — El alcance delegado por sucursal es subconjunto del actor y los recursos cross-tenant se ocultan

El alcance delegado por sucursal es subconjunto del actor y los recursos cross-tenant se ocultan sin enumerar
identidades/memberships.

### CAD-026-06 — Invite, cambio de rol/alcance y revoke registran actor, target, diff, motivo y correlation

Invite, cambio de rol/alcance y revoke registran actor, target, diff, motivo y correlation sin tokens/PII
excesiva.
