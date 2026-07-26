# Especificación — SPEC-095 OrderItemReady / OrderReady

El I0 actual sólo emite `ordering.order.ready.v1` cuando la derivación agregada de la Order cambia
a `READY`. No se emite `ordering.order-item.ready.v1`: el modelo actual no tiene allocations ni un
stream granular por ítem listo.

`ordering.order.ready.v1` se emite sólo cuando la derivación de SPEC-081 cambia a READY; incluye
`orderId`, `visitId`, `branchId`, `aggregateRevision` y `readyAt`. Usa outbox/envelope SPEC-217,
omite PII/notas y es idempotente por transición lógica.

El evento existe una única vez por transición lógica del agregado a READY. `tenantId` viaja en el
envelope, no dentro del payload. No incluye Guest, notas libres, pricing detallado, `stationId`,
`orderItemId`, `allocationId` ni revisiones de kitchen separadas.
