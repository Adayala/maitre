# Reglas — SPEC-076

- Created significa Reservation PENDING persistida, no confirmada.
- Outbox comparte commit y envelope sigue SPEC-217.
- Payload omite contacto/notas/tokens.
- Consumidores deduplican y ordenan por aggregate revision.
- Created requiere Hold HELD confirmado en el mismo commit.
- Compatibilidad v1 sólo admite adiciones opcionales; cambiar trigger exige nueva versión.
- Routing tenant/Branch no habilita suscripciones cross-tenant.
