# Especificación — SPEC-077 ReservationConfirmed

Nombre: `reservations.reservation.confirmed.v1`. Se emite sólo después de convertir atómicamente
un CapacityHold en consumo confirmado. El evento no completa ni compensa esa transacción.

Payload de dominio: `reservationId`, `branchId`, `capacityAllocationId`, `startAt`, `timezone`,
`durationMinutes`, `partySize`, `tableIds` opcionales, `confirmedAt` y `aggregateRevision`, además
del envelope SPEC-217. No contiene contacto. Un reintento sin cambio no crea otro hecho; una nueva
confirmación válida usa revisión superior.
