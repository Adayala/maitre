# Especificación — SPEC-078 ReservationCancelled

Nombre: `reservations.reservation.cancelled.v1`. Se escribe en outbox en la misma transacción que
cambia Reservation a `CANCELLED`. En este I0 no existe `CapacityHold`/`CapacityAllocation`
materializado como entidad separada, por lo que el evento no comunica liberaciones explícitas.

Payload: envelope, `reservationId`, `branchId`, `cancelledAt`, `reasonCode`, `actorType` y
`aggregateRevision`. Omite texto libre, PII y released allocation IDs fabricados. Los
consumidores actualizan proyecciones o disparan efectos informativos separados; no liberan
capacidad ni cobran penalidades en I0. Duplicados y delivery tardío convergen por event ID
y aggregate revision.

Partition key es `reservationId`. `actorType` usa `INTERNAL | PUBLIC | SYSTEM` y no
identifica personas. Gap obliga refetch autorizado; el evento no autoriza acciones posteriores.
