# Especificación — SPEC-077

Nombre: `reservations.reservation.confirmed.v1`. Se emite sólo después de convertir atómicamente
una Reservation `PENDING` en `CONFIRMED` y persistir el outbox correspondiente. En este I0 no
existe entidad separada de `CapacityAllocation` o `CapacityHold`.

Payload de dominio: `reservationId`, `branchId`, `startAt`, `durationMinutes`, `partySize`,
`tableIds` opcionales, `confirmedAt` y `aggregateRevision`, además del envelope. No contiene
Guest/contacto ni IDs de allocation fabricados. Partition key es `reservationId`.

Un retry sin cambio conserva el hecho lógico. Una reconfirmación autorizada usa `eventId` y
revisión superiores. Una revisión desactualizada no retrocede y un gap exige refetch. Consumers no
crean/liberan Allocation ni interpretan el evento como autorización.
