# Contrato API — SPEC-129 Cash Movement

Crear y listar movimientos de una sesión, y compensarlos mediante un comando separado. Create
requiere Idempotency-Key, importe decimal, categoría permitida y referencia cuando corresponda;
el servidor deriva tenant, branch, caja y actor. No existen update ni delete. Tests cubren
reintentos, sesión cerrada, límites, moneda, paginación estable, compensación, RBAC, auditoría
y aislamiento entre tenants.
