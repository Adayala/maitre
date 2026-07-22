# Contrato del evento — SPEC-078

`reservations.reservation.cancelled.v1` con tenant/branch/reservation, cancelledAt,
reasonCode categorizado, actorType y revision. La transacción de cancelación libera la autoridad
de capacidad y escribe outbox atómicamente; el evento sólo actualiza proyecciones. No publica
texto libre ni PII. Notificación/penalidad son consumidores separados. Tests cubren duplicate
cancel, confirm/cancel reorder, redacción, retry y convergencia.
