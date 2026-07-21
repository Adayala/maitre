# Contrato de evento — SPEC-094 OrderPlaced

Publicar una vez por transición lógica al aceptar una orden, mediante outbox transaccional.
El sobre versionado incluye eventId, occurredAt, tenantId, branchId, orderId, visitId,
catalogVersion e importes resumidos; no incluye PII ni notas libres. Consumidores deduplican
por eventId y toleran reordenamiento. Tests cubren rollback, reintento, evolución compatible,
correlación, observabilidad y aislamiento entre tenants.
