# Contrato — SPEC-001 Tenant

Tenant es la raíz organizacional y límite primario de aislamiento. Campos: id, legal/display
name, locale, default currency/timezone, status `PROVISIONING | ACTIVE | SUSPENDED |
CLOSED`, version y auditoría. No contiene plan, password, roles ni branches embebidas.

Todo recurso tenant-scoped referencia tenantId inmutable y repositorios/RLS lo aplican.
Suspensión bloquea nuevas mutaciones según política, preserva lectura/recuperación; cierre
requiere lifecycle de datos y no hard delete. Provisioning es idempotente. Tests cubren
aislamiento, defaults, transiciones, último owner/provisioning fallido y auditoría.
