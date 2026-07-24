# Reglas — SPEC-179

- `start` es idempotente y requiere lease.
- Full/backfill no reemplaza incremental sin policy explícita.
- Writes aplican ownership matrix e ID mapping.
- `PARTIAL` no se etiqueta success.
- `retry` no duplica side effects confirmados.
