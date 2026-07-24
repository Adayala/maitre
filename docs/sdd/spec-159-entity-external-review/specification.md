# Especificación — SPEC-159 ExternalReview

Guarda source/platform/location/external ID, rating original + normalized, texto sólo si ToS/base lo
permite, author redactado, canonical URL, remote timestamps, fetchedAt, raw hash y AdapterVersion.
Cada edición crea versión; delete remoto marca TOMBSTONED y ejecuta retención permitida.

Provenance y attribution nunca se pierden. Snapshot local no se presenta como contenido vigente si
freshness venció. Platform + external ID es identidad idempotente.

La entidad incluye `externalReviewId`, `platform`, `externalId`, `locationRef`, `subjectRef`,
`originalRating`, `normalizedRating`, `text?`, `authorDisplay?`, `canonicalUrl`, `remoteCreatedAt?`,
`remoteUpdatedAt?`, `fetchedAt`, `adapterVersion`, `rawHash`, `freshUntil?`, `status`,
`retentionClass`, `createdAt`, `updatedAt` y `revision`. `status` distingue `ACTIVE`, `STALE` y
`TOMBSTONED`.

La reseña externa es un snapshot local, no autoridad sobre el contenido remoto actual. Cualquier uso
en dashboards o scores debe respetar `freshUntil` y la política contractual del origen. El material
raw y la evidencia de origen pueden requerir acceso más restringido que la vista resumida.
