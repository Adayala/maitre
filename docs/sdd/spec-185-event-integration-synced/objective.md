# Objetivo — SPEC-185

Definir el evento terminal de sync de integración con outcome explícito, checkpoints sanitizados y
semántica clara para `PARTIAL`.

## Criterios de aceptación

### CAD-185-01 — El nombre canónico del evento es `integrations.sync.completed.v1`

el nombre canónico del evento es `integrations.sync.completed.v1`.

### CAD-185-02 — Se emite sólo en terminal `SUCCESS|PARTIAL|FAILED`

se emite sólo por run terminal `SUCCESS`, `PARTIAL` o `FAILED`.

### CAD-185-03 — El payload expone refs, recursos, checkpoint versions, counts y duration

el payload incluye integration/run IDs, direction/resources, original/new checkpoint
versions cuando hubo promoción, counts, duration y outcome.

### CAD-185-04 — Cursores raw, payloads, external IDs y secrets quedan fuera

el payload omite cursors raw, payloads, external IDs y secrets.

### CAD-185-05 — Retry crea otro run/correlation y `PARTIAL` no se interpreta como éxito completo

retry crea otro run/correlation y la misma transición terminal no reemite; consumidores
nunca interpretan `PARTIAL` como éxito completo.

### CAD-185-06 — La aprobación exige evidencia de outcomes, no-reemisión y redaction

La aprobación exige fixtures de success/partial/failed, no-reemisión, correlation y
redaction de checkpoints.
