# Especificación — SPEC-096 OrderItemDelivered / OrderDelivered

El I0 actual sólo emite `ordering.order.delivered.v1` cuando la derivación agregada de la Order
cambia a `DELIVERED`. No se emite `ordering.order-item.delivered.v1`: el modelo actual no tiene
allocations ni stream granular por ítem entregado.

`ordering.order.delivered.v1` sólo se emite cuando la derivación completa cambia a DELIVERED.
Ningún evento cierra Check ni captura pago. Reintentos, duplicados y orden alterado convergen por
event ID + aggregate revision; payloads omiten PII.

`ordering.order.delivered.v1` se emite una sola vez cuando la derivación agregada de Order pasa a
`DELIVERED` según SPEC-081. Una entrega repetida del mismo item no genera una segunda entrega
lógica del agregado.

El payload real incluye `orderId`, `visitId`, `branchId`, `aggregateRevision` y `deliveredAt`.
`tenantId` viaja en el envelope, no dentro del payload. No incluye Guest, notas libres, payment
details, `orderItemId`, `allocationId`, `actorType` ni `deliveryChannel`.
