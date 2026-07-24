# Especificación — SPEC-096 OrderItemDelivered / OrderDelivered

`ordering.order-item.delivered.v1` se emite al confirmar handoff de una allocation, con order,
item/allocation, actor type, channel, deliveredAt y revisions. Soporta entrega parcial.

`ordering.order.delivered.v1` sólo se emite cuando la derivación completa cambia a DELIVERED.
Ningún evento cierra Check ni captura pago. Reintentos, duplicados y orden alterado convergen por
event ID + aggregate revision; payloads omiten PII.

`ordering.order-item.delivered.v1` representa la confirmación de handoff de una allocation o unidad
entregable concreta. `ordering.order.delivered.v1` se emite una sola vez cuando la derivación
agregada de Order pasa a `DELIVERED` según SPEC-081. Un handoff repetido del mismo item no genera
una segunda entrega lógica.

Los payloads incluyen `tenantId`, `brandId`, `branchId`, `orderId`, `orderItemId?`,
`allocationId?`, `actorType`, `deliveryChannel`, `deliveredAt`, `aggregateRevision` y correlación
aprobada. No incluyen Guest, notas libres, payment details ni instrucciones internas no necesarias.
