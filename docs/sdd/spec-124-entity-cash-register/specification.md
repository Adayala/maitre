# Especificación — SPEC-124 CashRegister y CashSession

CashRegister configura una caja física/lógica por Branch: code, currencies permitidas y estado
`ACTIVE | SUSPENDED | RETIRED`. No representa una apertura ni guarda saldo corriente.

CashSession es el agregado autoritativo por register + currency: ID, business date/timezone,
openedAt/by, opening amount, cutoffAt, closedAt/by, ledger revision y status
`OPEN -> CLOSING -> CLOSED -> RECONCILED`; `SUSPENDED` es flag operativo. Sólo una OPEN/CLOSING por
register/currency. CLOSED es inmutable; diferencias posteriores crean LateAdjustment enlazado.

CashRegister pertenece a una única `branchId` y conserva `cashRegisterId`, `code`, `displayName`,
`allowedCurrencies`, `status` y metadata de configuración. Puede representar una caja física o
lógica, pero nunca una apertura concreta ni un saldo mutable. Su responsabilidad termina en la
configuración y disponibilidad del register.

CashSession referencia `cashRegisterId`, `currency`, `businessDate`, `timezone`, `openedAt`,
`openedBy`, `openingAmount`, `cutoffAt?`, `closedAt?`, `closedBy?`, `ledgerRevision` y `status`.
`SUSPENDED` funciona como flag operativo adicional y no reemplaza el lifecycle principal. Sólo puede
existir una sesión `OPEN` o `CLOSING` por `registerId + currency` al mismo tiempo.

`CLOSED` congela el ledger observado por esa sesión y es inmutable. Si después aparecen movimientos
legítimos tardíos o correcciones aprobadas, no se reabre la sesión: se crea un `LateAdjustment`
enlazado y auditable. `RECONCILED` expresa cierre validado contra reconciliación aprobada, no mera
finalización operativa.
