# Structure — SPEC-031

Rutas:
- `GET /v1/subscription`
- `POST /v1/subscriptions` — plataforma
- `PATCH /v1/subscriptions/{subscriptionId}`

Headers:
- `Authorization: Bearer <token>`
- `Idempotency-Key` en provisioning
- `If-Match` en PATCH

El contexto tenant se valida mediante Membership/capability; un selector no constituye autoridad.
