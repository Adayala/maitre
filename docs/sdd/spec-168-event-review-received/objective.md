# Objetivo — SPEC-168

Definir el evento técnico/funcional que propaga cambios en reseñas externas preservando provenance y
sin exponer texto o autor.

## Criterios de aceptación

### CAD-168-01 — El nombre canónico del evento es `feedback.external-review.changed.v1`

el nombre canónico del evento es `feedback.external-review.changed.v1`.

### CAD-168-02 — El evento cubre `CREATE`, `UPDATE` y `TOMBSTONE`

el evento cubre `CREATE`, `UPDATE` y `TOMBSTONE` sobre snapshots de reseñas externas.

### CAD-168-03 — El payload incluye refs, platform, source version y freshness

el payload incluye envelope, review/branch refs, platform, change type, source version,
rating normalized opcional, fetchedAt y freshness.

### CAD-168-04 — El payload omite texto, autor y raw provider payload

el payload omite texto, autor y raw provider payload.

### CAD-168-05 — Duplicados y reordering convergen por external review version

duplicados y reordering convergen por external review version sin romper consumidores.

### CAD-168-06 — La aprobación exige evidencia de create/update/tombstone, ordering y freshness

La aprobación exige fixtures de create/update/tombstone, ordering, deduplicación,
freshness y redaction.
