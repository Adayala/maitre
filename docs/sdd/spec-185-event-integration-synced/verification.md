# Verificación — SPEC-185

## Criterios

### CAD-185-01 — El nombre canónico del evento es `integrations.sync.completed.v1`

- [ ] el nombre canónico es `integrations.sync.completed.v1`.

### CAD-185-02 — Se emite sólo en terminal `SUCCESS|PARTIAL|FAILED`

- [ ] el evento se publica sólo en terminal `SUCCESS|PARTIAL|FAILED`.

### CAD-185-03 — El payload expone refs, recursos, checkpoint versions, counts y duration

- [ ] payload expone refs, recursos, checkpoint versions, counts y duration.

### CAD-185-04 — Cursores raw, payloads, external IDs y secrets quedan fuera

- [ ] cursores raw, payloads, external IDs y secrets quedan fuera.

### CAD-185-05 — Retry crea otro run/correlation y `PARTIAL` no se interpreta como éxito completo

- [ ] retry crea otro run/correlation y `PARTIAL` no se interpreta como éxito completo.

### CAD-185-06 — La aprobación exige evidencia de outcomes, no-reemisión y redaction

- [ ] fixtures cubren outcomes, no-reemisión, correlation y redaction.
