# Estructura — SPEC-040

Rutas:
- `GET /v1/menus`
- `POST /v1/menus`
- `GET/PATCH /v1/menus/{menuId}/revisions/{revision}`
- `POST /v1/menus/{menuId}/revisions/{revision}/publish`
- `POST /v1/menus/{menuId}/archive`

Headers:
- `Authorization: Bearer <token>`
- `Idempotency-Key` en create/publish
- `If-Match` en PATCH/publish

Tenant/Brand/alcances por sucursal se validan server-side; no existe DELETE.
