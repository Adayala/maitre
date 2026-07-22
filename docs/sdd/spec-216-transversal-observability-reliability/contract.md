# Contrato transversal — SPEC-216 Observability & Reliability

Logs estructurados allowlisted, métricas acotadas y trazas OpenTelemetry pasan por puertos
portables y comparten correlación. SLOs miden journeys críticos; alertas requieren owner y
runbook, evitando cardinalidad, PII y secretos. Fallos usan timeout, retry, circuit breaker y
degradación según semántica. Tests verifican redacción, propagación, presupuestos y recuperación.
