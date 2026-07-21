# Contrato — SPEC-029 Entitlement

Entitlement es el derecho efectivo derivado, no una asignación manual. Identidad lógica:
tenant + `code` + scope. Incluye source subscription/items, value tipado, vigencia,
calculation revision y `computedAt`.

No se edita por CRUD. Ante fuentes inválidas/expiradas se niega capacidad privilegiada; una
cache stale no amplía permisos/cuotas. Códigos y tipos son versionados. Recomputación es
idempotente y auditable, con reemplazo atómico de la proyección. Tests cubren reducción,
expiración, scopes, cache invalidation y aislamiento tenant.
