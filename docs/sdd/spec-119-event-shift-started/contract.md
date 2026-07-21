# Contrato de evento — SPEC-119 ShiftStarted

Publicar mediante outbox al comenzar lógicamente un turno. El sobre versionado incluye
eventId, occurredAt, tenantId, branchId, shiftId y conteos operativos, sin PII ni detalle de
remuneración. Reintentos conservan identidad y consumidores deduplican por eventId. Tests
cubren inicio manual o automático, rollback, duplicados, eventos tardíos, evolución compatible,
correlación, observabilidad y aislamiento entre tenants.
