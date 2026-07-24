# Objetivo — SPEC-205

Definir el evento de materialización de métricas como señal derivada, sujeta a supresión y sin valor
transaccional autoritativo.

## Criterios de aceptación

### CAD-205-01 — El nombre canónico del evento es `analytics.metric.materialized.v1`

El nombre canónico del evento es `analytics.metric.materialized.v1`.

### CAD-205-02 — El evento se emite sólo por nueva revisión de materialización

Se emite por nueva revisión de materialización.

### CAD-205-03 — El payload expone ID, versión, alcance, buckets permitidos, valor, coverage y revisión

El payload incluye metric ID/version, sucursal, period/grain, dimension buckets permitidos, value/unit,
coverage, freshness, input watermark y revisión de materialización.

### CAD-205-04 — Privacy suppression se aplica antes del evento y de logs

Privacy suppression se aplica antes del evento y de logs; cohorts pequeñas omiten value/dimensions
cuando corresponde.

### CAD-205-05 — Recompute idéntico no reemite y late data crea una revisión superior

Recompute idéntico no reemite y late data genera revisión superior; consumidores no lo usan como
autoridad transaccional.

### CAD-205-06 — La aprobación exige evidencia de supresión, no-reemisión, late data y materialización derivada

La aprobación exige fixtures de supresión, no-reemisión, late data, revisiones y materialización
derivada.
