# Especificación — SPEC-159 ExternalReview

Guarda source/platform/location/external ID, rating original + normalized, texto sólo si ToS/base lo
permite, author redactado, canonical URL, remote timestamps, fetchedAt, raw hash y AdapterVersion.
Cada edición crea versión; delete remoto marca TOMBSTONED y ejecuta retención permitida.

Provenance y attribution nunca se pierden. Snapshot local no se presenta como contenido vigente si
freshness venció. Platform + external ID es identidad idempotente.
