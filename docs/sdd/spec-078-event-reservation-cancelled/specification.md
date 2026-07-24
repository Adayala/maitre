# Especificación — SPEC-078 ReservationCancelled

Nombre: `reservations.reservation.cancelled.v1`. Se escribe en outbox en la misma transacción que
cambia Reservation a `CANCELLED` y libera su CapacityHold/CapacityAllocation autoritativo.

Payload: envelope SPEC-217, `reservationId`, `branchId`, `cancelledAt`, `reasonCode`, `actorType`,
`releasedAllocationId` opcional y `aggregateRevision`. Omite texto libre y PII. Los consumidores
actualizan proyecciones o solicitan notificaciones/consecuencias informativas; no liberan
capacidad ni cobran penalidades en I0. Duplicados y delivery tardío convergen por event ID
y aggregate revision.

Partition key es `reservationId`. `actorType` usa `INTERNAL | PUBLIC | SYSTEM` y no
identifica personas. Gap obliga refetch autorizado; el evento no autoriza acciones posteriores.
