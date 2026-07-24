# Especificación — SPEC-108 CommandReady / CommandCompleted

`kitchen.command.ready.v1` se emite al terminar producción. `kitchen.command.completed.v1` se emite
al confirmar retiro/handoff. No son sinónimos y ninguno significa entrega al Guest.

Payloads incluyen envelope SPEC-217, command/ticket/order allocation, station, actor type,
readyAt o completedAt y aggregate revision. Los eventos por Command permiten parciales; OrderReady
se deriva aparte. Reintentos y eventos tardíos convergen por ID/revision.

`kitchen.command.ready.v1` representa el fin de producción culinaria. `kitchen.command.completed.v1`
representa el retiro/handoff efectivo desde cocina. Son hechos separados y no intercambiables. Un
Command puede quedar READY sin estar COMPLETED, y ninguno de los dos implica entrega al Guest ni
liquidación comercial.

El payload mínimo incluye `tenantId`, `brandId`, `branchId`, `kitchenTicketId`, `commandId`,
`orderId`, `orderItemId`, `allocationId`, `stationId`, `actorType`, `readyAt?`, `completedAt?`,
`aggregateRevision` y correlación. No incluye PII, precios ni notas libres.
