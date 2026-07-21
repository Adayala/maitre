# Contrato de evento — SPEC-106 CommandReceived

Publicar mediante outbox cuando una comanda válida ingresa a producción. El sobre versionado
incluye eventId, occurredAt, tenantId, branchId, commandId, orderId, prioridad y destinos de
estación, sin PII ni notas libres. Consumidores deduplican por eventId y toleran reordenamiento.
Tests cubren rollback, fan-out de estaciones, reintento, evolución compatible, correlación y
aislamiento entre tenants.
