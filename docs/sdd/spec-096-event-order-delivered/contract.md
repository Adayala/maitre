# Contrato de evento — SPEC-096 OrderItemDelivered / OrderDelivered

Publicar `ordering.order.delivered.v1` sólo cuando la derivación agregada alcanza DELIVERED. I0 no
publica `ordering.order-item.delivered.v1`. El evento incluye referencias mínimas (`orderId`,
`visitId`, `branchId`, `aggregateRevision`, `deliveredAt`) sin PII. La transición es idempotente,
conserva correlación con OrderSubmitted y no cierra automáticamente la cuenta. Tests cubren la
transición agregada a DELIVERED, confirmaciones repetidas y ausencia de side effects sobre pagos.
