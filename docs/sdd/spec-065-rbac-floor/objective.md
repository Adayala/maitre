# Objetivo — SPEC-065

## Propósito

Definir decisiones de autorización de Floor y Billing operacional mediante permisos y
alcances efectivos, sin usar nombres de rol como autoridad ni habilitar overrides implícitos.

## Criterios de aceptación

### CAD-065-01 — Cada acción API se mapea a un permiso canónico único

Toda acción API de SPEC-055–060 se mapea exactamente a un permiso canónico
`resource.action`.

### CAD-065-02 — Toda decisión combina identidad, membership, permiso y alcance vigentes

Toda decisión exige identidad, Membership ACTIVE, permiso, tenant, Branch/assignment
scope y authorization revision vigentes.

### CAD-065-03 — Los perfiles operativos son assignments mínimos, no jerarquías implícitas

Perfiles MAITRE, WAITER, CASHIER, MANAGER, OWNER/ADMIN y COOK son assignments versionados
de mínimo privilegio, no jerarquía ni wildcard.

### CAD-065-04 — RBAC no reemplaza límites monetarios ni invariantes de dominio

Límites monetarios, ownership y reglas de dominio se evalúan además de RBAC y fallan
cerrado ante información ausente.

### CAD-065-05 — Las acciones sensibles exigen permiso dedicado y controles reforzados

reopen, void, refund sensible y force-close requieren permiso dedicado, reason
catalogado, step-up y aprobación segregada cuando la política lo indique.

### CAD-065-06 — La aprobación exige evidencia de allow/deny, auditoría y aislamiento

La aprobación exige matriz allow/deny, self-grant, stale authorization, no enumeración,
auditoría y aislamiento tenant/Branch.
