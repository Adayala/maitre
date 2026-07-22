# Especificación — SPEC-106 CommandReceived

`kitchen.command.received.v1` se emite por outbox al crear una TicketLine/Command RECEIVED. Envelope
SPEC-217 + command, kitchenTicket, order/item allocation, branch, station, routing policy version,
priority reason, receivedAt y aggregate revision. Omite PII, precios y notas libres. Un fan-out
crea un evento por Command; consumidores deduplican por event ID.
