# Rules — SPEC-107

- Se emite al pasar efectivamente a `IN_PROGRESS`, no en `CLAIMED`.
- Un retry o duplicate start no produce un segundo hecho lógico.
- Transfer o reassignment posteriores se representan por eventos separados.
- Payload mínimo excluye PII y datos comerciales innecesarios.
- Consumidores deduplican por `eventId` y toleran reorder por revisión/correlación.
