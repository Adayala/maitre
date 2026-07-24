# Objetivo — SPEC-004

## Propósito

Definir la sucursal mínima necesaria para operar y aislar recursos por tenant y Branch, con relaciones consistentes hacia Brand y FiscalEntity.

## Resultado esperado

1. Branch pertenece exactamente a un Tenant y una Brand del mismo Tenant.
2. FiscalEntity es opcional y, cuando existe, pertenece al mismo Tenant.
3. El código es estable y único dentro del Tenant.
4. Timezone y ubicación se modelan explícitamente sin un JSON de configuración abierto.
5. Servicios y límites se calculan desde Entitlements; no se copian en Branch.
6. Menús, horarios y políticas heredables se diseñan en sus dominios antes de incorporarlos.

## Fuera de alcance I0

- activación de módulos o servicios;
- herencia de menú o configuración de Brand;
- horarios comerciales y excepciones de calendario;
- datos fiscales o certificados embebidos;
- endpoints CRUD, definidos por su spec API.

## Criterios de aceptación

### CAD-004-01 — Branch modela una unidad operativa con alcance tenant

Branch expone `id`, `tenantId`, `brandId`, `code`, `name`, `status`, `timezone` y ubicación aprobada. No embebe menús, services ni configuración abierta.

### CAD-004-02 — Brand y FiscalEntity deben pertenecer al mismo Tenant

Toda Branch referencia una Brand del mismo tenant y, cuando existe, una FiscalEntity del mismo tenant. Las referencias cruzadas inválidas fallan tanto en aplicación como en persistencia.

### CAD-004-03 — `code` es estable, normalizado y único dentro del Tenant

`code` se normaliza antes de validar, no cambia de tenant y no colisiona dentro del mismo Tenant. El mismo `code` puede existir en tenants distintos.

### CAD-004-04 — Ubicación y timezone se modelan explícitamente

La dirección y `timezone` usan campos explícitos y validables. No existe un `config` abierto para esconder datos operativos o de layout de sucursal.

### CAD-004-05 — Branch no absorbe capacidades, menús ni entitlements

Servicios, límites, features y habilitaciones efectivas se resuelven fuera de Branch. Menús, horarios y políticas heredables viven en sus dominios aprobados.

### CAD-004-06 — Lifecycle, aislamiento y eventos de Branch son consistentes

Los estados válidos son `ACTIVE`, `INACTIVE` y `ARCHIVED`; `ARCHIVED` es terminal. Las mutaciones mantienen auditoría, aislamiento con alcance tenant y publicación atómica de `BranchCreated` mediante outbox.
