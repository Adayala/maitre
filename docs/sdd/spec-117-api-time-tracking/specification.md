# Especificación — SPEC-117 Time Tracking API

La superficie I0 de time tracking expone:

- `POST /v1/time-entries/clock-in`
- `POST /v1/time-entries/clock-out`
- `GET /v1/time-entries/:id`
- `GET /v1/employments/:employmentId/time-entries`
- `GET /v1/branches/:branchId/time-entries`
- `GET /v1/branches/:branchId/workforce-summary`
- `POST /v1/time-entries/:timeEntryId/adjustments`
- `GET /v1/time-entries/:timeEntryId/adjustments`
- `GET /v1/time-adjustments/:id`
- `POST /v1/time-adjustments/:id/approve`
- `POST /v1/time-adjustments/:id/reject`

No existe edición directa de `TimeEntry`.

Reglas implementadas para `clock-in`:

- el servidor fija `receivedAt`;
- el payload incluye `capturedAt`, `timezone`, `source`, `deviceId`, `deviceSequence` y
  `employmentId`, con `shiftAssignmentId?`;
- replay por `commandId` está soportado;
- sólo puede existir una entrada `OPEN` por employment;
- si hay `shiftAssignmentId`, debe pertenecer al mismo employment y branch y estar `CONFIRMED`;
- clock skew fuera de tolerancia o secuencia de dispositivo no monotónica marcan `pendingReview`.

Reglas implementadas para `clock-out`:

- replay por `commandId` está soportado;
- falla con `404` si no existe una `TimeEntry` abierta;
- falla con `409` si hay incoherencia temporal;
- si existe un `BreakLog` abierto, se rechaza o autocierra según `laborPolicyVersion`.

Reglas implementadas para ajustes:

- `request-adjustment`, `approve` y `reject` son comandos explícitos;
- requester y approver deben ser distintos;
- un ajuste no puede ser no-op ni invertir la ventana temporal;
- approval falla si la base efectiva quedó stale;
- la aprobación actualiza tiempos efectivos, no sobrescribe timestamps fuente.

Lecturas implementadas:

- list por employment con filtros `status`, `pendingReview`, `order`, `limit`, `offset`;
- list por branch con filtros `status`, `pendingReview`, `from`, `to`, `order`, `limit`, `offset`;
- list de adjustments por time entry con filtros `status`, `order`, `limit`, `offset`;
- summary por branch con contadores operativos.

Existe self-access acotado para `TimeEntry` y `TimeAdjustment`. En esa modalidad, la lectura de
ajustes redacta `requesterId`, `approverId` y `evidence`.

No está materializado en I0 un esquema de firma/session proof del dispositivo, ni edición directa
de marcas históricas, ni export como parte del contrato central de esta spec.
