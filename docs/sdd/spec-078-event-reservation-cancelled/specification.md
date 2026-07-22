# Especificación — SPEC-078 ReservationCancelled

Nombre: `reservations.reservation.cancelled.v1`. Se escribe en outbox en la misma transacción que
cambia Reservation a `CANCELLED` y libera su CapacityHold/CapacityAllocation autoritativo.

Payload: envelope SPEC-217, `reservationId`, `branchId`, `cancelledAt`, `reasonCode`, `actorType`,
`releasedAllocationId` opcional y `aggregateRevision`. Omite texto libre y PII. Los consumidores
actualizan proyecciones, notificaciones o penalidades; no son responsables de liberar capacidad.
Duplicados y delivery tardío convergen por event ID + aggregate revision.
