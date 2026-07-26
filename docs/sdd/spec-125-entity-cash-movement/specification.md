# Especificación — SPEC-125 CashMovement

Journal entry inmutable con amount positivo, currency, direction `IN|OUT`, type, session ID,
occurredAt, recordedAt, actor, `idempotencyKey?` y `sourceReference?`.

Tipos: OPENING(IN), CASH_SALE(IN), CASH_REFUND(OUT), DEPOSIT(OUT), WITHDRAWAL(OUT), TIP_IN/OUT,
ADJUSTMENT y CLOSING_COUNT informativo. Correcciones crean entrada compensatoria enlazada, nunca
update/delete.

CashMovement pertenece a una `cashSessionId` y conserva `cashMovementId`,
`amountMinorUnits` entero positivo, `currency`, `direction`, `type`, `occurredAt`, `recordedAt`,
`actor`, `idempotencyKey?`, `sourceType?`, `sourceReference?`, `compensatesMovementId?` y
`reason?`. El signo económico se deriva de `direction`, no de un monto negativo.

`CLOSING_COUNT` es un movimiento informativo o de evidencia y no reemplaza reconciliación aprobada.
No contribuye al balance, pero sí incrementa `ledgerRevision` para mantener orden monotónico del
journal.

Reglas implementadas:

- `amountMinorUnits` debe ser entero positivo;
- la currency del movimiento debe coincidir con la de la sesión;
- movimientos ordinarios requieren sesión `OPEN`;
- `CLOSING_COUNT` también puede registrarse en `CLOSING`;
- `ADJUSTMENT` requiere `direction` explícita;
- para el resto de los tipos, la dirección es fija por tipo;
- `sourceReference`, cuando existe, debe ser única por register;
- una compensación crea un nuevo `ADJUSTMENT` inverso enlazado al original;
- `CLOSING_COUNT` no puede compensarse;
- no se compensa contra sesiones `CLOSED` o `RECONCILED`.

No está implementada en I0 una integración automática con payments/checks ni convergencia por
`idempotencyKey`: el journal puede guardar la key, pero hoy la deduplicación efectiva materializada
es por `sourceReference` dentro del register.
