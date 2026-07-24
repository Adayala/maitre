# Especificación — SPEC-116 ShiftAssignments API

Create/list y comandos `confirm`, `decline`, `reassign`, `cancel`. Cada mutación usa idempotency key
y `If-Match`, y revalida Employment vigente, branch eligibility, función y conflictos en la misma
transacción.

Reassign cancela la asignación previa y crea la nueva de forma atómica, con motivo. Las respuestas
minimizan datos personales; self-service y management usan permisos distintos. Una notificación
es efecto outbox y no condiciona el resultado.

La API expone create/list/detail cuando corresponda y comandos explícitos `confirm`, `decline`,
`reassign` y `cancel`. No existe edición arbitraria de una asignación confirmada sin pasar por uno
de esos comandos de negocio. Fuera de alcance, detail usa `404`; las colecciones filtran antes de
paginar y aplicar redacción.

Cada mutación revalida en la misma transacción la vigencia de Employment, la elegibilidad por
sucursal, el rol/estación requeridos y los conflictos de labor policy. `reassign` garantiza que la
asignación previa quede cancelada y la nueva creada o confirmada como una sola operación lógica,
sin ventanas observables de doble cobertura o pérdida silenciosa.
