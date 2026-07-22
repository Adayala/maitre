# Contrato de evento — SPEC-096 OrderItemDelivered / OrderDelivered

Publicar `ordering.order-item.delivered.v1` por cada allocation entregada y
`ordering.order.delivered.v1` sólo cuando la derivación agregada alcanza DELIVERED, identificando
actor, canal, timestamp y revisiones sin PII. La transición es idempotente, conserva correlación
con OrderSubmitted y no cierra automáticamente la cuenta. Tests cubren entrega parcial,
confirmaciones repetidas, cancelación, reordenamiento y auditoría.
