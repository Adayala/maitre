# Estructura — SPEC-077

Producer: transacción confirm Reservation/Allocation/outbox. Aggregate/partition:
Reservation/`reservationId`. Payload cerrado con envelope, scope, calendario, partySize,
Allocation/revisiones, units opcionales y confirmedAt; sin PII.
