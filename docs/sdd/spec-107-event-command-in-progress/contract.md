# Contrato de evento — SPEC-107 CommandInProgress

Publicar una vez por transición lógica cuando comienza la producción efectiva de una comanda.
El sobre versionado incluye eventId, occurredAt, tenantId, branchId, commandId, stationId y
correlationId; no incluye PII. Reintentos conservan identidad y los consumidores soportan
duplicados y eventos fuera de orden. Tests cubren claims concurrentes, rollback, reasignación,
compatibilidad, observabilidad y deduplicación.
