# Contrato API — SPEC-116 Shift Assignments

La API materializada de `ShiftAssignment` incluye:

- create por shift;
- list por shift;
- list agregado por branch;
- detail por id;
- commands `confirm`, `decline`, `cancel`, `reassign`.

El contrato actual garantiza:

- `POST /v1/work-shifts/:workShiftId/assignments` con replay por `Idempotency-Key`;
- `POST /v1/shift-assignments/:id/{confirm|decline|cancel|reassign}` con control optimista por
  `If-Match`;
- replay idempotente por `Idempotency-Key` en los commands mutadores;
- validación de employment activo/elegible y de shift asignable en create/reassign;
- `reassign` devuelve `{ previous, current }`, dejando la previa cancelada y la nueva creada o
  confirmada según payload;
- mapeo de errores `400` para input/header inválido, `404` para recursos inexistentes/fuera de
  scope y `409` para conflictos, transición inválida o revisión vencida.

El contrato I0 también incluye lectura propia acotada para asignaciones del employment asociado a
la identidad externa del usuario, además de lectura de management por branch/shift.

No forman parte del contrato actual una edición genérica por `PATCH`, un payload enriquecido de
notificación como condición del resultado, ni una política de redacción de datos personales más
rica que el control de acceso por endpoint.
