# Structure — SPEC-054

Estructura lógica:

- identidad y scope: `servicePeriodId`, `tenantId`, `branchId`;
- calendario: `businessDate`, `timezone`, `type`, `name`;
- planificación: `plannedStartLocal`, `plannedEndLocal`,
  `servicePeriodPolicyVersion`;
- ejecución: `status`, `openedAt?`, `closingAt?`, `closedAt?`, `cancelledAt?`;
- excepciones: `cancellationReason?`, `forceCloseReason?`, findings pendientes;
- control: `revision`, actor, idempotency keys y auditoría.

Los instantes reales son inequívocos y conservan timezone/contexto local usado para derivar
businessDate. Orders, Check y cargos no se embeben ni se generan por pertenecer al período.
