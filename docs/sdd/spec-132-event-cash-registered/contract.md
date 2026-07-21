# Contrato de evento — SPEC-132 CashRegistered

Publicar mediante outbox por cada movimiento de caja aceptado, incluido su compensatorio. El
sobre versionado incluye eventId, occurredAt, tenantId, branchId, registerId, sessionId,
movementId, tipo, importe y moneda, sin PII ni texto libre. Tests cubren rollback, reintentos,
compensaciones, duplicados, reordenamiento, evolución compatible, correlación y aislamiento.
