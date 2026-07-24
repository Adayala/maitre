# Verificación — SPEC-169

## Criterios

### CAD-169-01 — El evento se emite sólo al materializar una nueva score version reputacional

- [ ] el evento se publica sólo con una nueva score version materializada.

### CAD-169-02 — El payload incluye score sólo si el privacy threshold se cumple

- [ ] payload incluye scope, ventana, coverage, buckets y score condicionado por threshold.

### CAD-169-03 — Sample size exacto y otros indicadores sensibles se suprimen o bucketean

- [ ] sample size exacto y datos sensibles se suprimen o bucketean.

### CAD-169-04 — La misma supresión aplica en eventos, logs y métricas derivadas

- [ ] supresión aplica igual en eventos, logs y métricas.

### CAD-169-05 — Recompute idéntico no reemite; cambios reales crean versión superior

- [ ] recompute idéntico no vuelve a emitir; cambios reales generan versión superior.

### CAD-169-06 — La aprobación exige evidencia de supresión, recompute y coverage/freshness

- [ ] fixtures cubren supresión, ordering, recompute y coverage/freshness.
