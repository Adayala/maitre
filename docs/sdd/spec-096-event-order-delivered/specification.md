# Especificación — SPEC-096 OrderItemDelivered / OrderDelivered

`ordering.order-item.delivered.v1` se emite al confirmar handoff de una allocation, con order,
item/allocation, actor type, channel, deliveredAt y revisions. Soporta entrega parcial.

`ordering.order.delivered.v1` sólo se emite cuando la derivación completa cambia a DELIVERED.
Ningún evento cierra Check ni captura pago. Reintentos, duplicados y orden alterado convergen por
event ID + aggregate revision; payloads omiten PII.
