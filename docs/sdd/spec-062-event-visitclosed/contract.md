# Contrato del evento — SPEC-062

`floor.visit.closed.v1` se publica tras el cierre confirmado. Payload mínimo:
tenant/sucursal/visit, `servicePeriodId` opcional, `closedAt`, `checkId`/revisión y revisión
agregada. No contiene importes, resúmenes de pago, line items ni PII. El workflow correctivo
de reopen publica `floor.visit.reopened.v1` correlacionado sin borrar el cierre. Consumidores
actualizan proyecciones idempotentemente; el reordenamiento se resuelve por revisión. Tests
cubren outbox, cierre duplicado, corrección, evento desactualizado, retry/DLQ y redacción.
