# Especificación — SPEC-125 CashMovement

Journal entry inmutable con amount positivo, currency, direction `IN|OUT`, type, session ID,
occurredAt, recordedAt, actor, idempotency key y source reference única.

Tipos: OPENING(IN), CASH_SALE(IN), CASH_REFUND(OUT), DEPOSIT(OUT), WITHDRAWAL(OUT), TIP_IN/OUT,
ADJUSTMENT y CLOSING_COUNT informativo. Pagos no-cash no generan CashMovement. Un Payment cash
capturado genera exactamente un movimiento por payment ID; refund, otro OUT. Correcciones crean
entrada compensatoria enlazada, nunca update/delete.
