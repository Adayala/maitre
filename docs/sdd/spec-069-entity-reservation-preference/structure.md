# Structure — SPEC-069

Estructura lógica:

- identidad/scope: `preferenceId`, tenantId;
- subject exclusivo: `guestId` o `reservationId`;
- semántica: `kind: PREFERENCE | REQUIREMENT`, code, typed value, priority;
- tratamiento: source, purpose, basis/consent proof, visibility, sensitivity;
- vigencia: `validFrom`, `validUntil?`, status y retention policy;
- control: revision, actor y auditoría.

No existe un único blob por Guest. El catálogo versionado define tipo, cardinalidad,
sensibilidad y reglas de combinación por code. Los snapshots de Reservation son separados e
inmutables.
