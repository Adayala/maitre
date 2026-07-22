# Especificación — SPEC-055 Visits API

Create/list/detail y commands `assign-tables`, `move`, `request-close`, `close`, `cancel`, `reopen`.
No PATCH status. Create/commands usan idempotency; transitions, `If-Match`.

Seat/move adquiere Occupancy con locks/constraints, no TableStatus. Request-close pasa a CLOSING;
close valida Check/payment/kitchen/occupancy. `409` exclusión/idempotencia, `412` revisión, `422`
transición. Reopen exige manager/reason y workflow correctivo.
