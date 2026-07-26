# Contrato de entidad — SPEC-114 Break Log

`BreakLog` registra inicio y fin de una pausa asociada a una `TimeEntry`. El contrato implementado
incluye:

- identidad y scope: `id`, `tenantId`, `timeEntryId`;
- clasificación: `breakType`, `paidClassification`, `laborPolicyVersion`;
- lifecycle: `status` (`OPEN` o `CLOSED`);
- tiempos fuente y efectivos: `openedAt`, `effectiveOpenedAt?`, `closedAt?`, `effectiveClosedAt?`;
- captura y trazabilidad: `timezone`, `source`, `deviceId`, `deviceSequence`, `openedCommandId?`,
  `closedCommandId?`, `findingReasonCode?`, `lastApprovedAdjustmentId?`, `revision`, `createdAt`,
  `updatedAt`.

El contrato actual garantiza una sola pausa `OPEN` por time entry, inicio sólo sobre jornadas
abiertas, cierre temporalmente coherente y control optimista por `expectedRevision` al cerrar.

No forman parte del contrato I0 restricciones completas sobre duración máxima, validación integral
contra el fin de jornada, ni un modelo de findings más amplio que los códigos actuales.
