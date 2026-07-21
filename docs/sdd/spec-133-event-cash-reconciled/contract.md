# Contrato de evento — SPEC-133 CashReconciled

Publicar mediante outbox al aprobar una reconciliación. El sobre versionado incluye eventId,
occurredAt, tenantId, branchId, registerId, sessionId, reconciliationId, moneda y diferencias
agregadas; no incluye evidencia sensible. Tests cubren rechazo previo, aprobación repetida,
rollback, duplicados, compatibilidad de esquema, correlación, observabilidad y aislamiento.
