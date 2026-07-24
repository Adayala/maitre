# Reglas — SPEC-057

- La API es read-only y devuelve cursor, source revisions y `asOf`.
- Precedencia sigue SPEC-051; Occupancy activa prevalece sobre reserva.
- Staleness/lag se comunica y no se transforma en AVAILABLE.
- Related resources y reasons no revelan Guest ni cross-tenant data.
- La precedencia es `BLOCKED > PAYING > OCCUPIED > CLEANING > RESERVED > AVAILABLE`.
- ETag representa la versión completa de la proyección y una respuesta `304` conserva
  semántica de freshness explícita.
- `404` oculta Table/Branch fuera de scope; una dependencia parcial usa estado de
  disponibilidad explícito, no un falso `404` o AVAILABLE.
