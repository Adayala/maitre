# Rules — SPEC-108

- `ready` y `completed` no son sinónimos ni colapsables por defecto.
- Ninguno implica delivery al Guest ni cierre comercial.
- Un retry o repeated handoff no produce un segundo hecho lógico equivalente.
- Payload mínimo excluye PII, precios y notas libres.
- Consumidores deduplican por `eventId` y toleran reorder por revisión/correlación.
