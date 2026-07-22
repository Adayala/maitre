# Especificación — SPEC-076 ReservationCreated

Nombre: `reservations.reservation.created.v1`. Se emite por outbox en la transacción que persiste
una nueva Reservation `PENDING`; creación no implica confirmación ni consumo definitivo.

Además del envelope SPEC-217 contiene `reservationId`, `branchId`, `startAt`, `timezone`,
`durationMinutes`, `partySize`, `source`, `status`, `aggregateRevision` y referencia opaca a Guest
cuando sea necesaria. Omite contacto, notas y tokens. Consumidores deduplican por event ID y
ordenan cambios del agregado por revision.
