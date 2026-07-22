# Especificación — SPEC-115 WorkShifts API

Create/list/detail/edit DRAFT y commands `publish`, `start`, `complete`, `cancel`. Create/commands
son idempotentes; edits/transiciones usan `If-Match`. Intervals se reciben como UTC + timezone IANA
y se validan contra LaborPolicyVersion.

Publish revalida cobertura, conflictos y Employment de assignments. Complete no cierra TimeEntry
individual silenciosamente; reporta entradas abiertas y exige workflow explícito. Responses
separan planificación de asistencia real.
