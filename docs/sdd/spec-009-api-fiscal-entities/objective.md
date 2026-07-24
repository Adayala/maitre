# Objetivo — SPEC-009

## Propósito

Administrar identidades fiscales privadas del tenant con minimización de datos, referencias seguras
a certificados y protección contra cambios retroactivos de evidencia fiscal.

## Criterios de aceptación

### CAD-009-01 — El CRUD opera sólo sobre FiscalEntities accesibles por contexto tenant

Create/list/get/PATCH sólo operan sobre FiscalEntities accesibles por contexto tenant y ocultan
recursos cross-tenant como `404`.

### CAD-009-02 — Tax ID se normaliza, valida y su unicidad no expone datos de otro tenant

Tax ID se normaliza/valida y su unicidad produce un conflicto determinista sin exponer el valor de
otro tenant.

### CAD-009-03 — Datos legales se minimizan o redactan; secretos y certificados nunca se exponen

Datos legales se minimizan o redactan por permiso; secretos/certificados nunca aparecen en respuestas,
logs ni auditoría.

### CAD-009-04 — Create es idempotente y PATCH exige `If-Match`

Create es idempotente y PATCH exige `If-Match`; cambios sensibles registran actor, motivo y diff
sanitizado.

### CAD-009-05 — No existe hard delete ni mutación retroactiva de snapshots usados por invoices

No existe eliminación física ni mutación retroactiva de snapshots usados por comprobantes; relaciones activas
bloquean cambios incompatibles.

### CAD-009-06 — OpenAPI, Problem Details y contract tests cubren validación fiscal, RBAC y aislamiento

OpenAPI, Problem Details y pruebas contractuales cubren validación fiscal, redacción, RBAC, uso por sucursal,
usage, concurrencia y aislamiento.
