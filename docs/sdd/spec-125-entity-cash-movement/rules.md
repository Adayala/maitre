# Rules — SPEC-125

- `amount` es siempre positivo; el signo económico vive en `direction`.
- Pagos no-cash no generan CashMovement.
- Payment cash y refund generan hechos separados y únicos por referencia aprobada.
- Correcciones son compensatorias append-only; no se edita ni borra journal previo.
- Source reference e idempotency key deben converger sin duplicar impacto económico.
