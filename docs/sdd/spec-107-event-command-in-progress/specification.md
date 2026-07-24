# Especificación — SPEC-107 CommandInProgress

`kitchen.command.in-progress.v1` se emite en la transición efectiva `CLAIMED -> IN_PROGRESS`, no al
claim. Incluye envelope SPEC-217, command/ticket/order allocation, station, owner actor reference,
startedAt y aggregate revision; omite PII. Reintentos no generan otro hecho lógico y una
transferencia posterior se representa con evento separado.

El evento no se emite al adquirir ownership (`CLAIMED`) sino al comenzar producción efectiva. Esa
diferencia evita que claims optimistas o reclamos abortados se interpreten como trabajo iniciado.
Si un Command cambia de owner o station antes de empezar, ese hecho debe expresarse por sus eventos
propios, no mediante `in-progress`.

El payload mínimo incluye `tenantId`, `brandId`, `branchId`, `kitchenTicketId`, `commandId`,
`orderId`, `orderItemId`, `allocationId`, `stationId`, `ownerActorRef`, `startedAt`,
`aggregateRevision` y correlación aprobada. No incluye PII, precios ni detalles no operativos.
