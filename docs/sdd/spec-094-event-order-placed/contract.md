# Contrato de evento — SPEC-094 OrderSubmitted

Publicar `ordering.order.submitted.v1` una vez por la transición lógica de submit que congela el
snapshot y crea el despacho de producción, mediante outbox transaccional. `OrderPlaced` queda como
nombre legado no publicable.
El sobre versionado incluye eventId, occurredAt, tenantId, branchId, orderId, visitId,
catalogVersion e importes resumidos; no incluye PII ni notas libres. Consumidores deduplican
por eventId y toleran reordenamiento. Tests cubren rollback, reintento, evolución compatible,
correlación, observabilidad y aislamiento entre tenants.
