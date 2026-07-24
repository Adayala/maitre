# Objetivo — SPEC-163

Definir la API de ratings con validación server-side de escalas y agregación privacy-safe.

## Criterios de aceptación

### CAD-163-01 — Create de rating es idempotente y valida escala/dimensión server-side

create de rating es idempotente dentro de Feedback y `ScaleVersion`, validando
dimensión/escala server-side.

### CAD-163-02 — El servidor calcula `normalizedValue`; el cliente no tiene autoridad

el servidor calcula `normalizedValue`; el cliente nunca envía el valor normalizado como
autoridad.

### CAD-163-03 — Aggregate devuelve buckets, score, coverage y versiones con freshness

aggregate por branch/dimension/window devuelve buckets, score, coverage,
formula/scale versions y freshness.

### CAD-163-04 — Threshold de privacidad suprime score, tamaño exacto y drill-down sensible

si el threshold de privacidad no se cumple, se suprimen score, tamaño exacto y drill-down
sensible.

### CAD-163-05 — La API bloquea recombinaciones de filtros que reconstruyan cohortes pequeñas

la API no permite combinar filtros para reconstruir cohortes pequeñas o identidades.

### CAD-163-06 — La aprobación exige evidencia de escalas, agregación y supresión

La aprobación exige fixtures de idempotencia, escalas, normalización, agregación,
supresión y ataques por recombinación de filtros.
