# Verificación — SPEC-118

## Criterios

### CAD-118-01 — Los comandos start/end y adjustment flow quedan definidos con claridad

- [x] comandos start/end/adjustment están definidos sin ambigüedad.

### CAD-118-02 — Start/end validan TimeEntry OPEN, unicidad y revision/break ID

- [x] TimeEntry OPEN, break uniqueness y revision/break ID se validan correctamente.

### CAD-118-03 — Protocolo offline y findings no inventan timestamps

- [x] protocolo offline y findings no inventan timestamps ni ocultan policy breaches.

### CAD-118-04 — Las correcciones son append-only con segregación requester/approver

- [x] ajustes append-only y segregación requester/approver se mantienen.
- [x] supervisor writes (`start`, `end`, `request/approve/reject adjustment`) respetan
  `branchScope` y responden `404` fuera de sucursales asignadas.

### CAD-118-05 — Self-access y supervisor access difieren en scope y exposición

- [x] self-access y supervisor access difieren en scope y redactions.
- [x] self-access sólo puede leer `TimeEntry`/`BreakLog`/`BreakAdjustment` propios.
- [x] supervisor access requiere permiso sensible y scope válido antes de usar listados por
  sucursal/Employment.
- [x] representaciones self-access de `BreakAdjustment` ocultan `requesterId`, `approverId` y
  `evidence`.

### CAD-118-06 — La aprobación exige evidencia de retry offline, clock-out y ajustes

- [x] fixtures cubren retry offline, clock-out con pausa, concurrencia y ajustes.
