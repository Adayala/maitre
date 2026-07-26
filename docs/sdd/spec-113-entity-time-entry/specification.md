# Especificación — SPEC-113 TimeEntry

TimeEntry registra clock-in y clock-out para un `Employment` en una `Branch`, con
`shiftAssignmentId` opcional. El contrato I0 conserva `capturedAt`, `receivedAt`, `timezone`,
`source`, `deviceId`, `deviceSequence` y `clockSkewMs`.

Lifecycle implementado: `OPEN -> CLOSED`. `pendingReview` es una bandera adicional y no reemplaza
el lifecycle principal.

Reglas implementadas:

- sólo puede existir una `TimeEntry` `OPEN` por `employmentId/tenantId`;
- el employment debe existir, estar activo y ser elegible para la sucursal;
- si se informa `shiftAssignmentId`, la asignación debe existir, pertenecer al mismo employment y
  branch, y estar `CONFIRMED`;
- `clockOut` exige una entrada `OPEN` y valida coherencia temporal básica;
- `clockIn` marca `pendingReview` por desvío excesivo de reloj o `deviceSequence` fuera de orden;
- si hay `BreakLog` abierto al hacer `clockOut`, se bloquea o autocierra según `laborPolicyVersion`.

Los ajustes no reemplazan el registro fuente: `TimeAdjustment` actualiza
`effectiveCapturedAt`/`effectiveClosedCapturedAt`, limpia `pendingReview` y deja trazabilidad vía
`lastApprovedAdjustmentId`.

No está implementado en I0 un estado `ADJUSTED`, políticas por sucursal para exigir shift siempre,
ni flujos de revisión más ricos que la bandera `pendingReview` con `reviewReason`.
