# Contrato — SPEC-049 Visit

Visit es la sesión operativa de un grupo en una Branch desde seating hasta cierre. Campos:
tenant/branch, guestCount, table assignments versionados, reservation opcional, status
`OPEN | PAYING | CLOSED`, timestamps y auditoría. Una mesa no participa en dos visitas
activas incompatibles. Cambios de mesa son comandos auditados, no reemplazo silencioso.
Cerrar exige cuenta/pagos consistentes y es irreversible salvo workflow correctivo. Tests
cubren concurrencia, capacity, transición, cross-tenant e idempotencia de comandos.
