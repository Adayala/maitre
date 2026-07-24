# Reglas — SPEC-062

- Sólo transición CLOSING→CLOSED produce el evento.
- Check/payments y Occupancies ya están consistentes al emitir.
- Payload omite PII/importes y usa envelope SPEC-217.
- Reopen correctivo emite su propio hecho y no borra el cierre previo.
- `eventId` es estable por hecho lógico; cada nueva transición usa un eventId y revisión nuevos.
- Un consumidor no usa closed/reopened como autorización para mutar Check, Payment u Occupancy.
- Compatibilidad v1 es aditiva opcional; cambios de significado exigen versión nueva.
