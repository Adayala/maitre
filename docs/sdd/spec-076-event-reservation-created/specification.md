# Especificación — SPEC-076 ReservationCreated

Nombre: `reservations.reservation.created.v1`. Se emite por outbox en la transacción que persiste
una nueva Reservation `PENDING`, su CapacityHold `HELD` y outbox; creación no implica
confirmación ni consumo definitivo.

Además del envelope SPEC-217 contiene `reservationId`, `branchId`, `startAt`, `timezone`,
`durationMinutes`, `partySize`, `source`, `status`, `capacityHoldId`, `holdExpiresAt` y
`aggregateRevision`. Omite Guest, contacto, notas, preferencias y tokens.

Partition key es `reservationId`; retries conservan eventId. Revisión menor/igual no
retrocede proyecciones y un gap exige refetch autorizado. El evento no autoriza confirmar,
notificar ni prolongar el Hold.
