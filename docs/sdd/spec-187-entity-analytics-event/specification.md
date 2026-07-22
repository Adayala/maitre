# Especificación — SPEC-187 AnalyticsEvent / Data Registry

DataRegistry versionado es autoridad de event type/schema, trusted producers, classification,
retention, owner, compatibility, quality rules, lineage y deprecation/backfill. IDs de señales son
inmutables.

AnalyticsEvent incluye registry ID/version, event/tenant/branch IDs, occurred/receivedAt, producer,
subject seudónimo y propiedades allowlisted. Ingest deriva tenant del productor, valida firma,
schema, tamaño/rate/clock y dedupe. Eventos inválidos van a cuarentena; cliente público nunca emite
hechos de negocio autoritativos.
