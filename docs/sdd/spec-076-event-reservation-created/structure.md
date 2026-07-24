# Estructura — SPEC-076

Producer: transacción Reservation/CapacityHold/outbox. Aggregate/partition:
Reservation/`reservationId`. Envelope SPEC-217 más scope, calendario, partySize,
source/status, Hold/expiry y revision. Schema cerrado a PII; consumers usan inbox/dedupe.
