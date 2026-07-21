# Contrato de evento — SPEC-095 OrderReady

Publicar cuando todos los componentes requeridos de una orden alcanzan ready, preservando
una única emisión lógica aunque existan reintentos. El sobre versionado incluye eventId,
occurredAt, tenantId, branchId, orderId y referencias operativas mínimas, sin PII ni notas
libres. Tests cubren preparación parcial, eventos duplicados o tardíos, reapertura autorizada,
compatibilidad de esquema, correlación y deduplicación.
