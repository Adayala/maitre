# Especificación — SPEC-116 ShiftAssignments API

La API I0 de `ShiftAssignment` expone create, list, detail y comandos explícitos `confirm`,
`decline`, `cancel` y `reassign`. No existe edición arbitraria fuera de esos comandos.

Surface materializado:

- `POST /v1/work-shifts/:workShiftId/assignments`
- `GET /v1/work-shifts/:workShiftId/assignments`
- `GET /v1/branches/:branchId/shift-assignments`
- `GET /v1/shift-assignments/:id`
- `POST /v1/shift-assignments/:id/confirm`
- `POST /v1/shift-assignments/:id/decline`
- `POST /v1/shift-assignments/:id/cancel`
- `POST /v1/shift-assignments/:id/reassign`

Reglas implementadas:

- create admite `Idempotency-Key`;
- `confirm`, `decline`, `cancel` y `reassign` exigen `If-Match`;
- los commands mutadores también aceptan `Idempotency-Key`;
- create/reassign validan employment existente, activo y elegible para la sucursal;
- create/reassign fallan si el shift no es asignable;
- `reassign` cancela la asignación previa y crea una nueva; opcionalmente puede confirmarla en la
  misma operación;
- `decline`, `cancel` y `reassign` exigen `reason` en payload y registran auditoría;
- las colecciones filtran antes de paginar.

Lectura:

- usuarios con permisos de management pueden leer por branch/shift y detail completo;
- existe self-read acotado para asignaciones propias;
- fuera de scope o inexistente, detail responde `404`.

No está implementado en I0 un modelo formal de redacción de PII dentro del payload de assignment,
ni validaciones profundas de labor policy más allá de la elegibilidad y asignabilidad hoy materializadas.
