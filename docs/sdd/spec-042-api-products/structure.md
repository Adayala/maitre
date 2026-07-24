# Structure — SPEC-042

Rutas:
- `GET/POST /v1/products`
- `GET/PATCH /v1/products/{productId}`

Headers:
- `Authorization: Bearer <token>`
- `Idempotency-Key` en create
- `If-Match` en PATCH

Tenant se valida server-side. Body JSON contiene asset refs; no multipart ni DELETE.
