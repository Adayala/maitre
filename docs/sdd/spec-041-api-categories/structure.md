# Structure — SPEC-041

Rutas:
- `GET/POST /v1/menu-revisions/{menuRevisionId}/categories`
- `PATCH /v1/categories/{categoryId}`
- `POST /v1/menu-revisions/{menuRevisionId}/categories/reorder`

Headers:
- `Authorization: Bearer <token>`
- `If-Match`/expectedRevision en mutaciones

Tenant/revision se resuelven server-side. No existe DELETE.
