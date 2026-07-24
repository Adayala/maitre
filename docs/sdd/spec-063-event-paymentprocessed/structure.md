# Estructura — SPEC-063

Seis schemas independientes, producidos por la transacción Payment/Refund/outbox después de
resolver un receipt verificado cuando corresponda. Identidad: eventId, operation identity y
aggregate revision. Partition: `paymentId`. Consumers previstos: Check, Cash, analytics y
reconciliation; la lista no concede autoridad implícita.
