# Verificación — SPEC-125

## Criterios

### CAD-125-01 — Scope, signo, currency, direction y type quedan definidos sin ambigüedad

- [ ] amount positivo, direction y type producen semántica económica inequívoca.

### CAD-125-02 — La relación con CashSession y ledger revision sigue reglas auditables

- [ ] relación con CashSession y ledger revision respeta estados permitidos.

### CAD-125-03 — Pagos cash y refunds producen un único movimiento lógico por referencia

- [ ] payment/refund cash generan exactamente un movimiento lógico por referencia.

### CAD-125-04 — No-cash queda fuera y las correcciones son compensatorias append-only

- [ ] no-cash queda fuera y correcciones usan entradas compensatorias.

### CAD-125-05 — Idempotency key y source reference única previenen duplicados económicos

- [ ] idempotency/source reference previenen duplicados económicos.

### CAD-125-06 — La aprobación exige evidencia de signo, compensación y sesión cerrada

- [ ] fixtures cubren moneda, sesión cerrada, compensación y cross-tenant.
