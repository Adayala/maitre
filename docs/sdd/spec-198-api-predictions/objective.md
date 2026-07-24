# Objetivo — SPEC-198

Definir la API de predicciones como request idempotente y asíncrono, con autorización previa,
presupuestos y abstención explícita.

## Criterios de aceptación

### CAD-198-01 — Request es idempotente por purpose, alcance, `asOf` y policy

Request es idempotente por purpose/alcance/asOf/model policy y se consulta vía get asíncrono.

### CAD-198-02 — Authorization precede feature retrieval y el snapshot queda con alcance tenant

Authorization precede feature retrieval y el feature snapshot queda con alcance tenant.

### CAD-198-03 — Timeout, budget y circuit breaker protegen la inferencia

Hard timeout, budget y circuit breaker se aplican al flujo de inferencia.

### CAD-198-04 — La respuesta distingue `COMPLETED`, `ABSTAINED` y `FAILED` con metadata completa

La respuesta devuelve `COMPLETED` o `ABSTAINED|FAILED` con model version, horizon, expiry, uncertainty,
baseline, explanation y freshness.

### CAD-198-05 — Fallback se declara explícitamente y no simula salida del modelo

Fallback se declara explícitamente y nunca simula salida del modelo; inputs/PII se redactan.

### CAD-198-06 — La aprobación exige evidencia de idempotencia, auth-before-features y redacción

La aprobación exige fixtures de idempotencia, auth-before-features, timeout/budget, abstention,
fallback declarado y redacción.
