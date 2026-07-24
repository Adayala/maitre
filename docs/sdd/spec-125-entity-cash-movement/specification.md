# Especificación — SPEC-125 CashMovement

Journal entry inmutable con amount positivo, currency, direction `IN|OUT`, type, session ID,
occurredAt, recordedAt, actor, idempotency key y source reference única.

Tipos: OPENING(IN), CASH_SALE(IN), CASH_REFUND(OUT), DEPOSIT(OUT), WITHDRAWAL(OUT), TIP_IN/OUT,
ADJUSTMENT y CLOSING_COUNT informativo. Pagos no-cash no generan CashMovement. Un Payment cash
capturado genera exactamente un movimiento por payment ID; refund, otro OUT. Correcciones crean
entrada compensatoria enlazada, nunca update/delete.

CashMovement pertenece a una `cashSessionId` y conserva `cashMovementId`, `amount` decimal positivo,
`currency`, `direction`, `type`, `occurredAt`, `recordedAt`, `actor`, `idempotencyKey`,
`sourceReference` y `reason?`. El signo económico se deriva de `direction`, no de un monto negativo,
para evitar ambigüedades contables.

`CLOSING_COUNT` es un movimiento informativo o de evidencia y no reemplaza reconciliación aprobada.
Un payment cash capturado genera exactamente un movimiento económico por `paymentId`; un refund
genera otro `OUT` distinto y trazable. Si una fuente intenta duplicar la referencia, la operación
debe converger sobre el mismo hecho lógico o fallar establemente.
