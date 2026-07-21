# Structure — SPEC-031

Rutas:
- GET /subscriptions/:tenantId
- POST /subscriptions/upgrade
- POST /subscriptions/:id/services
- DELETE /subscriptions/:id/services/:serviceId

Headers:
- Authorization: Bearer <token>
- X-Tenant-Id: <tenant>
