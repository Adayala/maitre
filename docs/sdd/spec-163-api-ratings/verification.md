# Verificación — SPEC-163

## Criterios

### CAD-163-01 — Create de rating es idempotente y valida escala/dimensión server-side

- [ ] create es idempotente y valida escala/dimensión server-side.

### CAD-163-02 — El servidor calcula `normalizedValue`; el cliente no tiene autoridad

- [ ] normalización se calcula sólo en servidor.

### CAD-163-03 — Aggregate devuelve buckets, score, coverage y versiones con freshness

- [ ] aggregates publican buckets, coverage, versiones y freshness.

### CAD-163-04 — Threshold de privacidad suprime score, tamaño exacto y drill-down sensible

- [ ] thresholds suprimen score, tamaño exacto y drill-down sensible.

### CAD-163-05 — La API bloquea recombinaciones de filtros que reconstruyan cohortes pequeñas

- [ ] recombinación de filtros no permite reconstruir cohortes pequeñas.

### CAD-163-06 — La aprobación exige evidencia de escalas, agregación y supresión

- [ ] fixtures cubren escalas, agregación, supresión e intentos de reconstrucción.
