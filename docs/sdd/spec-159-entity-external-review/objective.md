# Objetivo — SPEC-159

Definir ExternalReview como snapshot versionado y atribuible de reseñas de terceros, preservando
provenance, límites ToS y freshness.

## Criterios de aceptación

### CAD-159-01 — ExternalReview se identifica idempotentemente por plataforma, external ID y scope

external review queda identificado idempotentemente por platform + external ID +
location/subject scope.

### CAD-159-02 — La entidad conserva metadata completa de origen y versionado

la entidad conserva source, rating original/normalizado, URL canónica, timestamps remotos,
fetchedAt, raw hash y AdapterVersion.

### CAD-159-03 — Texto y autor se almacenan sólo si ToS y base lo permiten

texto y autor se almacenan sólo si ToS y base de tratamiento lo permiten, con
redacción/atribución apropiadas.

### CAD-159-04 — Ediciones remotas crean nuevas versiones y deletes remotos tombstonean

cada edición remota crea nueva versión local; delete remoto marca `TOMBSTONED` y ejecuta
sólo la retención permitida.

### CAD-159-05 — Provenance y attribution se preservan y freshness gobierna vigencia

provenance y attribution nunca se pierden y snapshots vencidos por freshness no se
presentan como contenido vigente.

### CAD-159-06 — La aprobación exige evidencia de upsert, tombstone, freshness y ToS

La aprobación exige fixtures de upsert idempotente, cambios remotos, tombstone, freshness,
ToS y attribution.
