# Structure — SPEC-042

Rutas:
- GET /categories/:categoryId/products
- POST /categories/:categoryId/products
- GET /products/:id
- PATCH /products/:id
- DELETE /products/:id

Headers:
- Authorization: Bearer <token>
- X-Tenant-Id: <tenant>
- Content-Type: multipart/form-data (for image)
