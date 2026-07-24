# Reglas — SPEC-078

- Cancel y release de capacity comparten transacción/outbox.
- Evento actualiza proyecciones; no libera autoridad por sí mismo.
- Reason es código allowlisted; texto/PII se omite.
- Duplicados/tardíos convergen por event ID/revision.
- Retry conserva eventId; una cancelación consumada no genera otro hecho.
- I0 no inicia Payment/Check/Invoice desde este evento.
- Compatibilidad v1 es aditiva opcional y routing permanece tenant/Branch-scoped.
