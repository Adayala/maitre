# Structure — SPEC-049

Estructura lógica, independiente de tecnología:

- identidad: `visitId`, `tenantId`, `branchId`;
- contexto: `guestCount`, `reservationId?`, `primaryGuestId?`;
- ciclo: `status`, `openedAt`, `closingRequestedAt?`, `closedAt?`,
  `cancelledAt?`, `cancellationReason?`;
- control: `revision`, auditoría e idempotency key de cada comando.

Las mesas no se duplican en un arreglo autoritativo: se obtienen de Occupancy ACTIVE. Orders
y Check referencian `visitId`; no son contenido embebido de Visit. La persistencia debe
proteger revisión y transiciones con control de concurrencia y conservar los timestamps
terminales.
