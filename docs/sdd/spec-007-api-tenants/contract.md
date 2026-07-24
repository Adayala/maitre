# Contrato API — SPEC-007

`POST /v1/tenants` es provisioning privilegiado/idempotente; `GET /v1/tenants/{id}` y
`PATCH` operan sólo contexto autorizado. No existe listado global para usuarios tenant ni
eliminación física. PATCH permite defaults/name/status compatibles con If-Match; tenantId y
ownership no cambian aquí.

Provisioning crea raíz mínima y outbox TenantCreated atómicamente, sin asumir Subscription
o datos demo. Problem Details: 404 anti-enumeración, 409 idempotencia/unicidad, 412 versión,
422 lifecycle. Tests cubren bootstrap seguro, retry, rollback, RBAC y auditoría.
