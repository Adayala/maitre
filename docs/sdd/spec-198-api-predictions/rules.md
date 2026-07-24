# Reglas — SPEC-198

- Request es idempotente por purpose/alcance/asOf/model policy.
- Authorization precede feature retrieval.
- Timeout, budget y circuit breaker son obligatorios.
- La respuesta distingue completed, abstained y failed.
- Fallback se declara y no simula output del modelo.
