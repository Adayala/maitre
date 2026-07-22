# Especificación — SPEC-087 Orders API

- `POST /v1/visits/{visitId}/orders` crea DRAFT; ignora/rechaza importes del cliente.
- `POST /v1/orders/{id}/submit` revalida catálogo y congela snapshot en forma idempotente.
- `POST /v1/orders/{id}/cancel` cancela sólo cantidades elegibles mediante OrderAdjustment.
- GET list/detail aplica tenant/branch/visit scope y redacción.

Create/submit requieren `Idempotency-Key`; comandos requieren `If-Match`. El servidor devuelve
`409 CATALOG_CHANGED` con diferencias, `409` por conflicto idempotente, `412` por revisión y `422`
por transición. Submit crea KitchenTicket + outbox en la misma unidad transaccional.
