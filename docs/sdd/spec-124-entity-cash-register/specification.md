# Especificación — SPEC-124 CashRegister y CashSession

CashRegister configura una caja física/lógica por Branch: code, currencies permitidas y estado
`ACTIVE | SUSPENDED | RETIRED`. No representa una apertura ni guarda saldo corriente.

CashSession es el agregado autoritativo por register + currency: ID, business date/timezone,
openedAt/by, opening amount, cutoffAt, closedAt/by, ledger revision y status
`OPEN -> CLOSING -> CLOSED -> RECONCILED`; `SUSPENDED` es flag operativo. Sólo una OPEN/CLOSING por
register/currency. CLOSED es inmutable; diferencias posteriores crean LateAdjustment enlazado.
