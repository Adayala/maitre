# Contrato del evento — SPEC-062

`floor.visit.closed.v1` tras cierre irreversible confirmado. Payload: tenant/branch/visit,
serviceId, closedAt, duration, check/payment summary no sensible y revision. No contiene
line items ni PII. Consumidores actualizan mesas/dashboard/analytics idempotentemente;
reordenamiento se resuelve por revision. Tests cubren outbox, duplicate close, stale event,
retry/DLQ y redacción.
