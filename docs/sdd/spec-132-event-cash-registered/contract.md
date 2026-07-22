# Contrato de evento — SPEC-132 CashMovementRecorded

Publicar `cash.cash-movement.recorded.v1` mediante outbox por cada movimiento aceptado, incluido
su compensatorio. `CashRegistered` queda como nombre legado no publicable. El
sobre versionado incluye eventId, occurredAt, tenantId, branchId, registerId, sessionId,
movementId, tipo, importe y moneda, sin PII ni texto libre. Tests cubren rollback, reintentos,
compensaciones, duplicados, reordenamiento, evolución compatible, correlación y aislamiento.
