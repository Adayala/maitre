# Especificación — SPEC-128 Cash Sessions API

List CashRegister y commands `open-session`, `begin-close`, `close-session`, `suspend`, `resume`.
Open requiere currency, opening count, business date y idempotency key; constraint evita doble
sesión. Begin-close fija cutoff y bloquea movimientos ordinarios nuevos.

Close congela ledger revision y crea reconciliation DRAFT; no acepta expected total del cliente.
Pagos pendientes se reportan como blocker o siguen la policy explícita de late settlement. Todos
los commands usan `If-Match`; excepciones requieren permiso, motivo y auditoría.
