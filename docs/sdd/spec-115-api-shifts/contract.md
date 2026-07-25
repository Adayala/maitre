# Contrato API — SPEC-115 Shifts

Crear, listar, obtener, actualizar, publicar, completar y cancelar turnos con filtros por
sucursal y rango temporal. Idempotency-Key protege create y los comandos, mientras If-Match
protege edición; publicar valida cobertura y conflictos configurados. La API usa instantes UTC
y zona IANA explícita. Tests cubren paginación, DST, solapamientos, transiciones inválidas,
concurrencia, RBAC, auditoría y aislamiento entre tenants.

En I0 el surface material mínimo queda acotado a create/list/detail y commands `publish`, `start`,
`complete`, `cancel`; update DRAFT con `If-Match` permanece como contrato deseado pero puede quedar
pendiente de materialización explícita.
