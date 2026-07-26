# Contrato de entidad — SPEC-113 Time Entry

`TimeEntry` registra clock-in/clock-out de un employment para una sucursal y una asignación de turno
opcional. El contrato implementado incluye:

- identidad y scope: `id`, `tenantId`, `branchId`, `employmentId`, `shiftAssignmentId?`;
- lifecycle: `status` (`OPEN` o `CLOSED`);
- tiempos fuente y efectivos: `capturedAt`, `effectiveCapturedAt?`, `receivedAt`,
  `closedCapturedAt?`, `effectiveClosedCapturedAt?`, `closedReceivedAt?`;
- contexto de captura: `timezone`, `source`, `deviceId`, `deviceSequence`, `clockSkewMs`;
- revisión y trazabilidad: `pendingReview`, `reviewReason?`, `lastApprovedAdjustmentId?`,
  `openedCommandId?`, `closedCommandId?`, `revision`, `createdAt`, `updatedAt`.

El contrato actual garantiza una sola entrada `OPEN` por employment, validación del employment y de
la asignación confirmada cuando aplica, y cierre temporalmente coherente.

No forman parte del contrato I0 estados adicionales como `ADJUSTED`, evidencia rica dentro de la
entidad principal, ni políticas configurables por branch para permitir o bloquear trabajo sin shift.
