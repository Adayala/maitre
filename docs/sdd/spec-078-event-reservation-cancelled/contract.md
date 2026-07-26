# Contrato del evento — SPEC-078

`reservations.reservation.cancelled.v1` con tenant/branch/reservation, cancelledAt,
reasonCode categorizado, actorType y revision. I0 no publica `releasedAllocationId` ni una
entidad explícita de capacidad liberada; el evento sólo actualiza proyecciones. No publica
texto libre ni PII. Notificación/penalidad son consumidores separados. Tests cubren nombre de
evento y payload mínimo emitido.
