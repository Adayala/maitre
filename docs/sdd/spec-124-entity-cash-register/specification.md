# Especificación — SPEC-124 CashRegister y CashSession

CashRegister configura una caja física/lógica por Branch: code, currencies permitidas y estado
`ACTIVE | SUSPENDED | RETIRED`. No representa una apertura ni guarda saldo corriente.

CashSession es el agregado autoritativo por register + currency: ID, business date/timezone,
openedAt/by, opening amount, cutoffAt, closedAt/by, ledger revision y status
`OPEN -> CLOSING -> CLOSED -> RECONCILED`; `suspended` es un flag operativo. Sólo una `OPEN` o
`CLOSING` por `registerId + currency`.

CashRegister pertenece a una única `branchId` y conserva `cashRegisterId`, `code`, `displayName`,
`allowedCurrencies`, `status` y metadata de configuración. Puede representar una caja física o
lógica, pero nunca una apertura concreta ni un saldo mutable. Su responsabilidad termina en la
configuración y disponibilidad del register.

CashSession referencia `cashRegisterId`, `currency`, `businessDate`, `timezone`, `openedAt`,
`openedBy`, `openingAmountMinorUnits`, `cutoffAt?`, `closedAt?`, `closedBy?`, `ledgerRevision` y
`status`. `suspended` funciona como flag operativo adicional y no reemplaza el lifecycle principal. Sólo puede
existir una sesión `OPEN` o `CLOSING` por `registerId + currency` al mismo tiempo.

`CLOSED` congela el ledger observado por esa sesión y es inmutable. Al cerrar, el sistema crea una
`CashReconciliation` inicial `DRAFT` con `expectedMinorUnits` calculado del lado servidor desde el
opening y los movimientos congelados. `RECONCILED` expresa cierre validado contra reconciliación
aprobada, no mera finalización operativa.

No está implementado en I0 un mecanismo especial de `LateAdjustment` o reapertura lógica de una
sesión cerrada: un movimiento legítimo tardío cae en la sesión siguiente.
