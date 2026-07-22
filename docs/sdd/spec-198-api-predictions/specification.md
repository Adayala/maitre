# Especificación — SPEC-198 Predictions API

Request idempotente por purpose/scope/asOf/model policy y async get. Authorization precede feature
retrieval; feature snapshot queda tenant-scoped. Hard timeout/budget y circuit breaker aplican.

Response COMPLETED o ABSTAINED/FAILED con model version, horizon, expiry, uncertainty, baseline,
explanation/freshness. Fallback se declara y no simula salida del modelo. Inputs/PII se redactan.
