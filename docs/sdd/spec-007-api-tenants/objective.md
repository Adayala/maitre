# Objetivo — SPEC-007

## Propósito

Exponer provisioning y administración mínima de Tenant sin permitir enumeración global,
reasignación de identidad ni acoplar la raíz organizacional a Subscription, datos demo o al
proveedor de identidad.

## Criterios de aceptación

### CAD-007-01 — Sin capability de provisioning no se puede crear ni inferir tenants

Un actor sin capability de provisioning no puede crear tenants ni inferir su existencia.

### CAD-007-02 — Reintentar provisioning con la misma key produce una sola raíz y un solo hecho lógico

Reintentar provisioning con la misma key/payload produce una única raíz y un único hecho lógico
`TenantCreated`; cambiar payload devuelve conflicto.

### CAD-007-03 — Tenant y outbox se confirman o revierten atómicamente

Tenant y outbox se confirman o revierten atómicamente, sin raíz parcial visible.

### CAD-007-04 — GET y PATCH sólo resuelven contexto autorizado y ocultan recursos inexistentes o cross-tenant

GET/PATCH sólo resuelven contexto autorizado y responden `404` ante recursos inexistentes o
cross-tenant sin distinguirlos.

### CAD-007-05 — PATCH no modifica `tenantId` ni ownership y exige `If-Match`

PATCH no modifica `tenantId` ni ownership, exige `If-Match` y aplica lifecycle explícito sin hard
delete.

### CAD-007-06 — OpenAPI, Problem Details, auditoría y contract tests cubren bootstrap y concurrencia

El contrato OpenAPI, Problem Details, auditoría y pruebas contractuales cubren bootstrap, retry,
rollback, RBAC y concurrencia.
