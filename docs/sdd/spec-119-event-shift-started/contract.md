# Contrato de evento — SPEC-119 WorkShiftStarted

Publicar `workforce.work-shift.started.v1` sólo cuando un command cambia WorkShift de PUBLISHED a
IN_PROGRESS; no representa primer clock-in ni hora planificada. El sobre versionado incluye
eventId, occurredAt, tenantId, branchId, shiftId y conteos operativos, sin PII ni detalle de
remuneración. Reintentos conservan identidad y consumidores deduplican por eventId. Tests
cubren inicio administrativo, rollback, duplicados, eventos tardíos, evolución compatible,
correlación, observabilidad y aislamiento entre tenants.

En I0, `branchId`, intervalo planificado, `startedAt`, `laborPolicyVersion`, `aggregateRevision` y
`actorType` constituyen el payload mínimo obligatorio; conteos operativos/privacy-threshold quedan
diferidos u opcionales.
