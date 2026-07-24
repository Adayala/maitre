# Structure — SPEC-021

Rutas:
- `POST /v1/users/invitations`
- `GET /v1/users`
- `GET /v1/users/{userId}`
- `PATCH /v1/users/{userId}`

Headers:
- `Authorization: Bearer <token>`
- selector de Tenant según SPEC-023/213, validado contra Membership

Un header o path puede solicitar contexto, pero no prueba pertenencia. Response envelope:
`{ data, meta: { correlationId } }`.
