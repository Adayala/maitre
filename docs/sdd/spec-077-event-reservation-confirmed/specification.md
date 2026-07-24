# Especificación — SPEC-077

Nombre: `reservations.reservation.confirmed.v1`. Se emite sólo después de convertir atómicamente
un CapacityHold en consumo confirmado. El evento no completa ni compensa esa transacción.

Payload de dominio: `reservationId`, `branchId`, `capacityAllocationId`, `startAt`, `timezone`,
`durationMinutes`, `partySize`, `allocationRevision`, `tableIds`
opcionales, `confirmedAt` y `aggregateRevision`, además del envelope SPEC-217. No contiene
Guest/contacto. Partition key es `reservationId`.

Un retry sin cambio conserva el hecho lógico. Una reconfirmación autorizada usa `eventId` y
revisión superiores. Una revisión desactualizada no retrocede y un gap exige refetch. Consumers no
crean/liberan Allocation ni interpretan el evento como autorización.
