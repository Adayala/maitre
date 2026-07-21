# Contrato de evento — SPEC-108 CommandCompleted

Publicar mediante outbox al completar todas las unidades requeridas de una comanda, sin
confundir ready con delivered. El sobre versionado incluye eventId, occurredAt, tenantId,
branchId, commandId, orderId y resumen de estaciones, sin PII ni contenido libre. Tests
cubren finalización parcial, duplicados, reapertura excepcional, eventos tardíos, evolución
compatible, correlación y aislamiento entre tenants.
