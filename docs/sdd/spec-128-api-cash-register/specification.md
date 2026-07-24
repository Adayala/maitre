# Especificación — SPEC-128 Cash Sessions API

List CashRegister y commands `open-session`, `begin-close`, `close-session`, `suspend`, `resume`.
Open requiere currency, opening count, business date y idempotency key; constraint evita doble
sesión. Begin-close fija cutoff y bloquea movimientos ordinarios nuevos.

Close congela ledger revision y crea reconciliation DRAFT; no acepta expected total del cliente.
Pagos pendientes se reportan como blocker o siguen la policy explícita de late settlement. Todos
los commands usan `If-Match`; excepciones requieren permiso, motivo y auditoría.

El surface expone list/detail de registers y sesiones visibles dentro del scope autorizado, más los
comandos explícitos `open-session`, `begin-close`, `close-session`, `suspend` y `resume`. No existe
patch genérico de estado ni edición opaca de una sesión activa o cerrada.

`open-session` recibe currency, opening count, business date/timezone e `Idempotency-Key`; el
servidor deriva actor, tenant, branch y register desde el contexto autorizado. `begin-close`
materializa `cutoffAt` y bloquea movimientos ordinarios nuevos según policy. `close-session`
congela `ledgerRevision`, crea reconciliation `DRAFT` y nunca confía en `expected` calculado por el
cliente.

Pagos pendientes o eventos de cash no asentados al momento del cierre pueden bloquear el cierre o
seguir un workflow explícito de late settlement. Si se permite override, éste requiere permission
separada, reason y auditoría before/after, sin ocultar el desvío respecto del flujo normal.
