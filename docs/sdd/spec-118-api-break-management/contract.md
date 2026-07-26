# Contrato API — SPEC-118 Break Management

La API materializada de break management incluye:

- start/end de pausas;
- reads singulares y listados de `BreakLog`;
- create/list/detail/approve/reject de `BreakAdjustment`.

El contrato actual garantiza:

- `start` con validación de `TimeEntry` abierta y unicidad de pausa `OPEN`;
- `end` con control optimista por `expectedRevision`;
- request/approve/reject de ajustes con segregación requester/approver y protección contra stale base;
- listados por `TimeEntry`, por `Branch` y por `BreakLog` con filtros y paginación;
- mapeo de errores `400` para input inválido, `404` para recursos inexistentes/fuera de scope y
  `409` para conflictos de estado, revisión o validación.

El contrato I0 incluye dos niveles de lectura:

- supervisor access con permiso `time:read_sensitive` y scope válido;
- self-access sólo para pausas y ajustes asociados a la propia jornada.

En self-access, `BreakAdjustment` se entrega redactado en `requesterId`, `approverId` y `evidence`.
El listado supervisorio por branch no está disponible para self-access.

No forman parte del contrato actual un modelo más rico de findings en la API de breaks, ni edición
directa de pausas históricas fuera del flujo de ajustes.
