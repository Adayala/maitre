# Verificación — SPEC-198

## Criterios

### CAD-198-01 — Request es idempotente y el resultado se consulta de forma asíncrona

Request es idempotente y el resultado se consulta de forma asíncrona.

### CAD-198-02 — La autorización ocurre antes del feature retrieval y el snapshot queda con alcance tenant

La autorización ocurre antes del feature retrieval y el snapshot queda con alcance tenant.

### CAD-198-03 — Timeout, budget y circuit breaker protegen la inferencia

Timeout, budget y circuit breaker protegen la inferencia.

### CAD-198-04 — Las respuestas distinguen `COMPLETED`, `ABSTAINED` y `FAILED` con metadata completa

Las respuestas distinguen `COMPLETED`, `ABSTAINED` y `FAILED` con metadata completa.

### CAD-198-05 — Fallback se declara y no simula salida del modelo; PII se redacta

Fallback se declara y no simula salida del modelo; PII se redacta.

### CAD-198-06 — Fixtures cubren idempotencia, auth-before-features, budgets, abstention y fallback

Fixtures cubren idempotencia, auth-before-features, budgets, abstention y fallback.
