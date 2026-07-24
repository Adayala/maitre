# Objetivo — SPEC-016

## Propósito

Aplicar autorización deny-by-default a Organization usando Membership, capabilities y alcances
server-side, sin confiar en claims editables, visibilidad de UI ni roles nominales aislados.

## Criterios de aceptación

### CAD-016-01 — Toda acción resuelve identidad, Membership activa, capability y alcance autoritativos

Toda acción resuelve identidad, Membership activa, capability y alcance del tenant autoritativo antes de
evaluar reglas de dominio.

### CAD-016-02 — La matriz OWNER/ADMIN/MANAGER produce allow/deny determinista

La matriz OWNER/ADMIN/MANAGER produce allow/deny determinista por recurso/acción; EMPLOYEE requiere
rol funcional y alcance explícito.

### CAD-016-03 — El alcance por sucursal limita Brand, FiscalEntity, Branch, Salon y Table

El alcance por sucursal limita Brand/FiscalEntity/Branch/Salon/Table según contrato y todo acceso cross-tenant
permanece denegado.

### CAD-016-04 — ADMIN no crea OWNER ni delega capabilities que no posee

ADMIN no crea OWNER ni delega capabilities que no posee; self-grant, elevación y confused deputy son
rechazados.

### CAD-016-05 — Membership suspendida o revocada deja de autorizar sin depender de claims editables

Membership suspendida/revocada deja de autorizar sin depender de claims editables o caches stale;
repositorio/RLS sólo agregan defensa.

### CAD-016-06 — Denegaciones usan 401/403/404 y las decisiones sensibles se auditan sin secretos

Denegaciones usan 401/403/404 sin enumeración y las decisiones sensibles registran actor, tenant,
acción, recurso y correlation ID sin secretos.
