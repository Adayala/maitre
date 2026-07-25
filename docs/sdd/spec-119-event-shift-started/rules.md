# Rules — SPEC-119

- Se emite sólo en `PUBLISHED -> IN_PROGRESS`.
- No representa primer clock-in ni hora planificada por sí sola.
- Payload mínimo excluye Employment IDs, time entries y remuneración.
- Agregados/privacy-threshold son opcionales en I0; si existen, se suprimen bajo umbral.
- Reintentos no generan un segundo hecho lógico; consumidores deduplican por `eventId`.
