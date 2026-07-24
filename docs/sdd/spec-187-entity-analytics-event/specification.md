# Especificación — SPEC-187 AnalyticsEvent / Data Registry

DataRegistry versionado es autoridad de event type/schema, trusted producers, classification,
retention, owner, compatibility, quality rules, lineage y deprecation/backfill. IDs de señales son
inmutables.

AnalyticsEvent incluye registry ID/version, event/tenant/branch IDs, occurred/receivedAt, producer,
subject seudónimo y propiedades allowlisted. Ingest deriva tenant del productor, valida firma,
schema, tamaño/rate/clock y dedupe. Eventos inválidos van a cuarentena; cliente público nunca emite
hechos de negocio autoritativos.

La entidad `AnalyticsEvent` incluye `analyticsEventId`, `registryEventType`, `registryVersion`,
`tenantId`, `branchId?`, `producerId`, `occurredAt`, `receivedAt`, `subjectRef?`, `properties`,
`qualityStatus`, `quarantineReason?` y `revision`. `properties` sólo admite claves y shapes aprobadas
por el registry; cualquier expansión requiere nueva versión o compatibilidad explícita.

El registry separa eventos puramente observacionales de señales derivadas de hechos de negocio
autoritativos. Un productor público o de cliente jamás puede usarse para afirmar transiciones de
negocio críticas sin una cadena de confianza y autoridad distinta.
