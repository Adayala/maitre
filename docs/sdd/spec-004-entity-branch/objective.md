# Objetivo — SPEC-004

## Propósito

Definir la sucursal mínima necesaria para operar y aislar recursos por Tenant y Branch, con relaciones consistentes hacia Brand y FiscalEntity.

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
