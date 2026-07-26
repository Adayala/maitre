# Contrato API — SPEC-117 Time Tracking

La API materializada de time tracking incluye:

- `clock-in` y `clock-out`;
- reads singulares y listados de `TimeEntry`;
- create/list/detail/approve/reject de `TimeAdjustment`;
- `workforce-summary` por branch.

El contrato actual garantiza:

- `clock-in` y `clock-out` con replay por `commandId`;
- `receivedAt` fijado por el servidor;
- validación de employment, branch scope y asignación confirmada cuando aplica;
- una sola `TimeEntry` abierta por employment;
- marcado de `pendingReview` ante skew excesivo o secuencia de dispositivo no monotónica;
- request/approve/reject de ajustes con segregación requester/approver y protección contra stale base;
- listados con filtros y paginación en time entries y adjustments;
- mapeo de errores `400` para input inválido, `404` para recursos inexistentes/fuera de scope y
  `409` para conflictos de estado o validación.

El contrato I0 incluye self-access acotado para entries y adjustments propios. En self-access,
`TimeAdjustment` se entrega redactado en `requesterId`, `approverId` y `evidence`.

No forman parte del contrato actual la firma del dispositivo, un workflow de revisión más rico que
`pendingReview`/`reviewReason`, ni edición directa de registros históricos.
