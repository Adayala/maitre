# Especificación — SPEC-116 ShiftAssignments API

Create/list y commands `confirm`, `decline`, `reassign`, `cancel`. Cada mutación usa idempotency key
y `If-Match`, y revalida Employment vigente, branch eligibility, función y conflictos en la misma
transacción.

Reassign cancela la asignación previa y crea la nueva de forma atómica, con motivo. Responses
minimizan datos personales; self-service y management usan permisos distintos. Una notificación
es efecto outbox y no condiciona el resultado.
