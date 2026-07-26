# Contrato de evento — SPEC-094 OrderSubmitted

Publicar `ordering.order.submitted.v1` una vez por la transición lógica de submit que congela el
snapshot y crea el despacho de producción, mediante outbox transaccional. `OrderPlaced` queda como
nombre legado no publicable.
El sobre versionado incluye eventId, occurredAt, tenantId, branchId, orderId, visitId,
`catalogRevisionId` opcional e importes resumidos; no incluye PII ni notas libres. El I0 real
usa tipos `Date` para timestamps del payload dentro del proceso y no publica un segundo evento en
reintentos de submit. Consumidores deduplican por eventId y toleran reordenamiento. Tests cubren
reintento idempotente, correlación básica y aislamiento entre tenants.
