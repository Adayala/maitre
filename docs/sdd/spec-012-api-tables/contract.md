# Contrato API — SPEC-012

## Alcance

Configurar mesas físicas bajo `/v1/salons/{salonId}/tables`. La configuración pertenece a
Organization; el estado operativo derivado pertenece a SPEC-051/057 y no se persiste ni se
edita desde esta API.

## Operaciones

| Operación | Resultado |
| --- | --- |
| `POST /v1/salons/{salonId}/tables` | crea configuración de mesa |
| `GET /v1/salons/{salonId}/tables` | lista configuración, sin estado operativo autoritativo |
| `GET /v1/tables/{tableId}` | devuelve configuración |
| `PATCH /v1/tables/{tableId}` | modifica campos configurables con `If-Match` |

No hay hard delete. Una mesa referenciada se inactiva; moverla entre salones no está
permitido en PATCH y requiere workflow explícito futuro.

## Datos

Creación: `number` único normalizado por salón, `capacity` 1–20, `name`, `shape`, `zone`,
features accesibles y posición visual opcionales. Coordenadas de layout no son autoridad
geográfica ni afectan aislamiento.

## Reglas

- salon, branch y tenant deben ser coherentes;
- capacidad total respeta el límite administrativo del salón;
- no se reduce capacidad por debajo de una asignación/ocupación activa;
- `status` derivado no se acepta en body;
- bloquear/limpiar/ocupar una mesa pertenece a contratos operativos, no a este CRUD.

## Errores, permisos y aceptación

Problem Details según SPEC-215; `404` también cubre cross-tenant, `409` número duplicado,
`412` versión y `422` regla operativa/capacidad. Create/PATCH requieren permisos de
configuración SPEC-016; lectura requiere scope de branch. Tests cubren tenant isolation,
unicidad, límites, rechazo de `status`, concurrencia, auditoría y schema OpenAPI.
