# Estructura — SPEC-046

Rutas:
- `GET /v1/dashboard/setup-status`

Headers:
- `Authorization: Bearer <token>`
- `If-None-Match` opcional

Tenant/alcance por sucursal se valida server-side. Respuesta: items derivados + revision/asOf/freshness.
