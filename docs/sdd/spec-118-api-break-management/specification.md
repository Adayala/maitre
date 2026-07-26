# Especificación — SPEC-118 Break Management API

La superficie I0 de breaks expone:

- `POST /v1/breaks/start`
- `POST /v1/breaks/:id/end`
- `GET /v1/breaks/:id`
- `GET /v1/time-entries/:timeEntryId/breaks`
- `GET /v1/branches/:branchId/breaks`
- `POST /v1/breaks/:breakLogId/adjustments`
- `GET /v1/breaks/:breakLogId/adjustments`
- `GET /v1/break-adjustments/:id`
- `POST /v1/break-adjustments/:id/approve`
- `POST /v1/break-adjustments/:id/reject`

Reglas implementadas:

- `start` exige `TimeEntry` existente y `OPEN`;
- `start` falla si ya existe otra pausa `OPEN` para la misma jornada;
- `start` recibe `commandId?`, `deviceId`, `deviceSequence`, `openedAt`, `timezone`, `source`,
  `breakType`, `paidClassification` y `laborPolicyVersion`;
- `end` exige `expectedRevision` y `closedAt`;
- `end` falla por conflicto si la revisión cambió o si el cierre es inválido;
- `clock-out` sobre una jornada con break abierto se resuelve fuera de esta API según
  `laborPolicyVersion`: rechazo o autocierre auditado.

Reglas implementadas para ajustes:

- create/list/detail/approve/reject de `BreakAdjustment`;
- requester y approver deben ser distintos;
- el ajuste no puede ser no-op ni dejar una ventana inválida;
- approval falla si la base efectiva quedó stale;
- los ajustes actualizan tiempos efectivos, no timestamps fuente.

Lecturas implementadas:

- list por `TimeEntry` con `status`, `order`, `limit`, `offset`;
- list supervisorio por `Branch` con `status`, `from`, `to`, `order`, `limit`, `offset`;
- list por `BreakLog` de sus ajustes con `status`, `order`, `limit`, `offset`.

Acceso:

- supervisor access requiere permiso sensible y scope válido de sucursal;
- self-access sólo puede consultar pausas y ajustes asociados a su propia jornada;
- en self-access, `BreakAdjustment` redacta `requesterId`, `approverId` y `evidence`;
- self-access no puede usar el listado supervisorio por branch.

No está implementado en I0 un engine amplio de findings dentro de esta API, ni una política que
“invente” timestamps: la corrección sigue siendo append-only vía ajustes.
