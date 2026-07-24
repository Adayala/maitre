# Estructura — SPEC-087

```text
Orders API
├── POST /v1/visits/{visitId}/orders
├── GET /v1/visits/{visitId}/orders
├── GET /v1/orders/{orderId}
├── POST /v1/orders/{orderId}/submit
└── POST /v1/orders/{orderId}/cancel

Controles comunes
├── auth scope + branch/visit validation
├── Idempotency-Key / If-Match
├── server-side pricing and snapshot freeze
└── audit + outbox consistency
```
