# Contrato API — SPEC-031

API administrativa para consultar/provisionar Subscription sin procesar pagos. Operaciones:
`GET /v1/subscription`, `POST /v1/subscriptions` sólo plataforma autorizada y
`PATCH /v1/subscriptions/{id}` con `If-Match` para status/items compatibles.

Tenant objetivo nunca se confía desde cliente común. Idempotency-Key protege provisión;
respuestas incluyen revisión y no exponen términos internos. `409` cubre vigente duplicada,
`412` concurrencia y `422` transición/config inválida. Toda mutación audita y dispara
recomputación/outbox transaccional. Tests incluyen aislamiento entre tenants y cero integración de cobro.
