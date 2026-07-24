# Objetivo — SPEC-187

Definir AnalyticsEvent y su DataRegistry como fuente versionada, validada y no ambigua de señales
analíticas.

## Criterios de aceptación

### CAD-187-01 — `DataRegistry` versionado gobierna type, schema, producers y lineage

`DataRegistry` versionado es autoridad de event type/schema, trusted producers, classification,
retention, owner, compatibility, quality rules, lineage y deprecation/backfill.

### CAD-187-02 — Los IDs son inmutables y cambios incompatibles crean nuevas versiones o tipos

Los IDs de señales/eventos son inmutables y los cambios incompatibles crean nuevas versiones o tipos.

### CAD-187-03 — `AnalyticsEvent` conserva refs, tiempos, productor y propiedades allowlisted

`AnalyticsEvent` incluye registry ID/version, event/tenant/branch IDs, occurredAt/receivedAt,
producer, subject seudónimo y propiedades allowlisted.

### CAD-187-04 — Ingest deriva tenant y valida firma, schema, límites y deduplicación

Ingest deriva tenant del productor, valida firma, schema, tamaño, rate, clock y deduplicación antes
de aceptar el evento.

### CAD-187-05 — Eventos inválidos van a cuarentena y clientes públicos no emiten hechos autoritativos

Eventos inválidos van a cuarentena y cliente público nunca emite hechos de negocio autoritativos.

### CAD-187-06 — La aprobación exige evidencia de versionado, dedupe, validación y pseudonimización

La aprobación exige fixtures de registry versioning, dedupe, schema validation, quarantine, trusted
producers y pseudonimización.
