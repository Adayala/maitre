# Structure — SPEC-070

Estructura lógica:

- policy/version: `cancellationPolicyId`, version, tenantId, `branchId?`, `channel?`,
  `[effectiveFrom,effectiveUntil)`, timezone, status y revision;
- reglas ordenadas: window bounds, classification, allowed, reasonCode y consequences
  informativas tipadas;
- override: `cancellationOverrideId`, Reservation/policy version, actor, permission,
  reasonCode, scope, `expiresAt`, approval/evidence y consumedAt.

Las versiones publicadas son inmutables. No existe “una fila mutable por Branch”; la
resolución selecciona una versión efectiva y conserva su identidad en Reservation.
