# Contrato — SPEC-001 Tenant

Tenant es la raíz organizacional y límite primario de aislamiento. Campos: id, nombre legal/de
presentación, locale, moneda/timezone por defecto, status `ACTIVE | SUSPENDED | ARCHIVED`, version y
auditoría. No contiene plan, password, roles ni sucursales embebidas.

Todo recurso con alcance tenant referencia tenantId inmutable y repositorios/RLS lo aplican.
`SUSPENDED` bloquea nuevas mutaciones operativas según política y preserva lectura/recuperación
administrativa autorizada; `ARCHIVED` es terminal, requiere ciclo de vida de datos y no implica hard
delete. Provisioning es idempotente. Tests cubren aislamiento, defaults, transiciones, último owner,
provisioning fallido y auditoría.
