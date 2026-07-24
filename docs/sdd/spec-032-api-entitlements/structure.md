# Structure — SPEC-032

Rutas:
- `GET /v1/entitlements` — incluye Entitlements + Quotas relacionadas

Headers:
- `Authorization: Bearer <token>`
- `If-None-Match` opcional

El selector de Tenant/Branch se valida contra Membership/scope y no prueba autoridad.
