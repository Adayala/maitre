# Contrato API — SPEC-102 Commands

Listar, obtener y ejecutar start/complete/cancel sobre comandas de cocina mediante
transiciones explícitas. El contexto deriva tenant, sucursal y estación; If-Match evita
escrituras perdidas y cada comando operativo admite idempotencia. Las respuestas separan
estado agregado de los ítems y no exponen notas fuera del rol autorizado. Tests cubren
concurrencia, reintentos, estados terminales, reasignación, RBAC y aislamiento entre tenants.
