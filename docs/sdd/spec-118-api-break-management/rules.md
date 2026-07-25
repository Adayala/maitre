# Rules — SPEC-118

- `start` requiere TimeEntry OPEN y ausencia de otra pausa abierta.
- `end` refiere break ID y expected revision válidos.
- Policy puede clasificar y generar findings, pero no inventar timestamps.
- Ajustes son append-only y segregan requester/approver.
- Acceso supervisor requiere permiso sensible y branch/employment scope.
- Acceso propio sólo lee su propio `TimeEntry` y derivados; listados supervisorios por sucursal quedan
  fuera de ese modo.
- En acceso propio, `BreakAdjustment` redacta `requesterId`, `approverId` y `evidence`.
