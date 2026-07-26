# Contrato del evento — SPEC-076

`reservations.reservation.created.v1` tras persistencia/outbox. Payload mínimo: tenant,
branch, reservationId, start/duration, partySize, source, status y revision; Guest/contact se
omiten. I0 no publica `CapacityHold`, expiry ni timezone. Delivery al menos una vez.
Consumidores deduplican y no tratan creación como confirmación. Tests cubren nombre de evento
y payload mínimo emitido sin PII.
