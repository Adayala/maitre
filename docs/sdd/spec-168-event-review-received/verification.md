# Verificación — SPEC-168

## Criterios

### CAD-168-01 — El nombre canónico del evento es `feedback.external-review.changed.v1`

- [ ] el nombre canónico es `feedback.external-review.changed.v1`.

### CAD-168-02 — El evento cubre `CREATE`, `UPDATE` y `TOMBSTONE`

- [ ] el evento cubre create, update y tombstone.

### CAD-168-03 — El payload incluye refs, platform, source version y freshness

- [ ] payload expone refs, platform, change type, source version y freshness.

### CAD-168-04 — El payload omite texto, autor y raw provider payload

- [ ] texto, autor y raw payload quedan fuera.

### CAD-168-05 — Duplicados y reordering convergen por external review version

- [ ] convergencia por versionado soporta duplicados y reordering.

### CAD-168-06 — La aprobación exige evidencia de create/update/tombstone, ordering y freshness

- [ ] fixtures cubren transiciones, ordering, freshness y redaction.
