# Objetivo — SPEC-125

Definir CashMovement como journal entry inmutable de caja con dirección, tipo, referencia única e
idempotencia por fuente.

## Criterios de aceptación

### CAD-125-01 — Scope, signo, currency, direction y type quedan definidos sin ambigüedad

scope, signo, currency, direction y type quedan definidos sin ambigüedad.

### CAD-125-02 — La relación con CashSession y ledger revision sigue reglas auditables

la relación con CashSession abierta/cerrada y ledger revision sigue reglas explícitas y
auditables.

### CAD-125-03 — Pagos cash y refunds producen un único movimiento lógico por referencia

pagos cash y refunds producen exactamente un movimiento lógico por referencia aprobada.

### CAD-125-04 — No-cash queda fuera y las correcciones son compensatorias append-only

pagos no-cash no generan CashMovement y las correcciones son compensatorias, nunca
update/delete.

### CAD-125-05 — Idempotency key y source reference única previenen duplicados económicos

idempotency key y source reference única previenen duplicados económicos.

### CAD-125-06 — La aprobación exige evidencia de signo, compensación y sesión cerrada

La aprobación exige fixtures de signo, moneda incompatible, sesión cerrada, duplicados,
compensación y aislamiento.
