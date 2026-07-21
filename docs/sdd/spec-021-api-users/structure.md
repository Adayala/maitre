# Structure — SPEC-021

Rutas:
- POST /users
- GET /users
- GET /users/:id
- PATCH /users/:id

Headers:
- Authorization: Bearer <token>
- X-Tenant-Id: <tenant>

Response format: { data, meta: { correlationId } }
