# Reglas — SPEC-077

- Evento sólo sigue a allocation CONFIRMED atómica.
- No completa ni compensa consumo de capacidad.
- Payload incluye allocation/horario/revision, sin contacto.
- Reconfirmación sin cambio no emite otro hecho lógico.
- Retry conserva eventId y cada hecho nuevo incrementa aggregateRevision.
- Compatibilidad v1 es aditiva opcional; cambiar trigger exige versión.
- Routing/consumers respetan scope y no usan el evento como permiso.
