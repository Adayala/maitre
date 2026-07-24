# Reglas — SPEC-061

- Outbox comparte transacción con Visit/Occupancy.
- Envelope sigue SPEC-217 y payload omite Guest/notas.
- Un submit lógico produce un hecho; delivery puede repetirse.
- Consumidores no recrean la autoridad Occupancy.
- `occurredAt`/`openedAt` provienen del reloj autoritativo y `eventId` permanece estable en retries.
- La compatibilidad v1 sólo permite cambios aditivos opcionales; cambios semánticos exigen versión.
- Routing incorpora tenant/Branch sin permitir suscripción cross-tenant no autorizada.
