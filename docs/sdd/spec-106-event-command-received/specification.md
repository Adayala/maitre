# Especificación — SPEC-106 CommandReceived

`kitchen.command.received.v1` se emite por outbox al crear una TicketLine/Command RECEIVED. Envelope
SPEC-217 + command, kitchenTicket, order/item allocation, branch, station, routing policy version,
priority reason, receivedAt y aggregate revision. Omite PII, precios y notas libres. Un fan-out
crea un evento por Command; consumidores deduplican por event ID.

El evento representa exclusivamente el ingreso autoritativo de una unidad de trabajo a producción.
No sustituye eventos posteriores de start, ready o completed, ni sirve para inferir progreso
efectivo. Si una orden produce múltiples Commands por station o split operativo, cada Command emite
su propio hecho lógico.

El payload mínimo incluye `tenantId`, `brandId`, `branchId`, `kitchenTicketId`, `commandId`,
`orderId`, `orderItemId`, `allocationId`, `stationId`, `routingPolicyRevisionId`, `priorityReason`,
`receivedAt` y `aggregateRevision`, más la correlación aprobada por SPEC-217. No incluye guest PII,
precios, datos fiscales ni notas libres.
