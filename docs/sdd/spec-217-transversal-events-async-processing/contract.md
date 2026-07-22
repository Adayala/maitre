# Contrato transversal — SPEC-217 Events & Async Processing

Eventos versionados usan sobre común, outbox transaccional, consumidores idempotentes y
deduplicación persistente. No se promete exactly-once: reintentos, orden parcial, dead-letter y
replay son explícitos. Payloads minimizan PII y nunca contienen secretos. Contract tests cubren
compatibilidad, rollback, duplicados, eventos tardíos, poison messages, observabilidad y
aislamiento entre tenants.
