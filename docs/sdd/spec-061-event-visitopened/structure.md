# Estructura — SPEC-061

Producer: transacción create Visit/Occupancy y outbox. Aggregate/partition: Visit/`visitId`.
Payload: envelope SPEC-217 más scope, referencias operativas, guestCount, openedAt y
aggregateRevision. El schema rechaza campos adicionales sensibles. Consumidores mantienen
inbox/dedupe y nunca escriben Occupancy autoritativa.
