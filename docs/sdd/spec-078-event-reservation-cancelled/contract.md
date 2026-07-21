# Contrato del evento — SPEC-078

`reservations.reservation.cancelled.v1` con tenant/branch/reservation, cancelledAt,
reasonCode categorizado, actorType y revision. No publica texto libre ni PII. Libera
capacidad mediante proyección idempotente; notificación/penalidad son consumidores separados
y no implícitos. Tests cubren duplicate cancel, confirm/cancel reorder, redacción, retry y
convergencia.
