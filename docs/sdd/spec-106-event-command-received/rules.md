# Rules — SPEC-106

- Se emite vía outbox al crear Command en estado RECEIVED.
- El fan-out es por unidad Command, no por Order o KitchenTicket agregado.
- Un retry no genera un segundo hecho lógico para la misma creación.
- Payload mínimo excluye PII, precios y notas libres.
- Consumidores deduplican por `eventId`; reorder se resuelve por revisión/correlación.
