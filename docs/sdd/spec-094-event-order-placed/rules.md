# Rules — SPEC-094

- `OrderPlaced` es sólo alias legado; el contrato publicable es `ordering.order.submitted.v1`.
- Se emite vía outbox transaccional tras commit exitoso del submit.
- Un retry del mismo submit no produce un segundo hecho lógico.
- Payload mínimo: suficiente para consumidores aprobados, sin PII ni notas libres.
- Consumidores deduplican por `eventId`; reorder se resuelve por revisión/correlación.
