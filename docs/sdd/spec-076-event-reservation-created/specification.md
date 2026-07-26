# Especificación — SPEC-076 ReservationCreated

Nombre: `reservations.reservation.created.v1`. Se emite por outbox en la transacción que persiste
una nueva Reservation `PENDING` y su registro de outbox. En este I0 no existe entidad separada
de `CapacityHold`: crear no implica confirmación ni consumo definitivo de capacidad.

Además del envelope contiene `reservationId`, `branchId`, `startAt`, `durationMinutes`,
`partySize`, `source`, `status` y `aggregateRevision`. Omite Guest, contacto, notas,
preferencias, tokens y cualquier campo de hold fabricado.

Partition key es `reservationId`; retries conservan eventId. Revisión menor/igual no
retrocede proyecciones y un gap exige refetch autorizado. El evento no autoriza confirmar,
notificar ni inferir confirmación/capacidad reservada.
