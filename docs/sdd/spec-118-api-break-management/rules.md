# Rules — SPEC-118

- `start` requiere TimeEntry OPEN y ausencia de otra pausa abierta.
- `end` refiere break ID y expected revision válidos.
- Policy puede clasificar y generar findings, pero no inventar timestamps.
- Ajustes son append-only y segregan requester/approver.
- Acceso supervisor requiere permiso sensible y branch/employment scope.
