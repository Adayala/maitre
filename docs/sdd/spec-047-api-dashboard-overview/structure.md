# Estructura — SPEC-047

Rutas:
- `GET /v1/dashboard/overview`

Headers:
- `Authorization: Bearer <token>`
- `If-None-Match` opcional

Tenant/alcance por sucursal se valida server-side. Aggregator aplica budget/timeouts por fuente.
