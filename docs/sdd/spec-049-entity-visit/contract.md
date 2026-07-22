# Contrato — SPEC-049 Visit

Visit es la sesión operativa de un grupo en una Branch desde seating hasta cierre. Campos:
tenant/branch, guestCount, table assignments versionados, reservation opcional, status
`OPEN | CLOSING | CLOSED | CANCELLED`, timestamps y auditoría. PAYING/seated/service son estados
derivados, no autoridad duplicada. Una mesa no participa en dos visitas
activas incompatibles. Cambios de mesa son comandos auditados, no reemplazo silencioso.
Cerrar exige cuenta/pagos consistentes y es irreversible salvo workflow correctivo. Tests
cubren concurrencia, capacity, transición, cross-tenant e idempotencia de comandos.
