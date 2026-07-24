# Contrato del evento — SPEC-076

`reservations.reservation.created.v1` tras persistencia/outbox. Payload mínimo: tenant,
branch, reservationId, CapacityHold/expiry, start/duration, partySize, source, status y
revision; Guest/contact se omiten. Delivery al menos una vez. Consumidores deduplican y no
tratan creación como confirmación. Tests cubren atomicidad, schema, timezone, redacción,
duplicates y retry/DLQ.
