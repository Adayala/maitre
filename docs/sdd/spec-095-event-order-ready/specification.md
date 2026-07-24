# Especificación — SPEC-095 OrderItemReady / OrderReady

`ordering.order-item.ready.v1` se emite por cada allocation que alcanza READY e incluye order ID,
item/allocation ID, station, readyAt y revisiones. Permite preparación parcial sin afirmar que la
orden completa está lista.

`ordering.order.ready.v1` se emite sólo cuando la derivación de SPEC-081 cambia a READY; incluye
las revisions que justifican el agregado. Ambos usan outbox/envelope SPEC-217, omiten PII/notas y
son idempotentes por transición lógica.

`ordering.order-item.ready.v1` existe para tracking operativo fino y puede emitirse múltiples veces
por Order a medida que distintas allocations alcanzan READY. `ordering.order.ready.v1` existe una
única vez por transición lógica del agregado a READY y nunca se usa como sustituto del evento por
item cuando hay preparación parcial.

Los payloads incluyen `tenantId`, `brandId`, `branchId`, `orderId`, `orderItemId?`,
`allocationId?`, `stationId?`, `aggregateRevision`, `kitchenRevision?`, `readyAt` y correlación con
submit original. No incluyen Guest, notas libres ni pricing detallado.
