# Especificación — SPEC-098 Command

Command es una TicketLine autoritativa de KitchenTicket (SPEC-086), no sinónimo ni segundo
agregado. Existe uno por OrderItem allocation + station routing revision y su ID permanece estable
durante el lifecycle.

Estados únicos: `RECEIVED | CLAIMED | IN_PROGRESS | ON_HOLD | READY | COMPLETED | CANCELLED`.
READY significa producción terminada; COMPLETED confirma retiro/handoff por expediter. Los errores
técnicos no son estado: quedan como attempt/error y retry; un fallo de negocio termina CANCELLED.

Payload usa union discriminada allowlisted por `commandType + schemaVersion`, con tamaño máximo y
campos tipados. No admite blobs, PII, precios ni notas libres fuera del campo sanitizado permitido.
Toda transición usa expected revision, idempotency key, actor y timestamp del servidor.
