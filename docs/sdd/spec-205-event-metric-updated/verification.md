# Verificación — SPEC-205

## Criterios

### CAD-205-01 — El nombre canónico es `analytics.metric.materialized.v1`

El nombre canónico es `analytics.metric.materialized.v1`.

### CAD-205-02 — El evento se publica sólo por nueva revisión de materialización

El evento se publica sólo por nueva revisión de materialización.

### CAD-205-03 — El payload expone ID, versión, alcance, buckets permitidos, valor, coverage y revisión

Payload expone ID/version, alcance, buckets permitidos, valor/unidad, coverage y revisión.

### CAD-205-04 — Supresión se aplica antes del evento o log y protege cohorts pequeñas

Supresión se aplica antes del evento/log y protege cohorts pequeñas.

### CAD-205-05 — Recompute idéntico no reemite y late data crea revisión superior

Recompute idéntico no reemite y late data crea revisión superior.

### CAD-205-06 — Fixtures cubren supresión, revisiones, late data y no-autoridad transaccional

Fixtures cubren supresión, revisiones, late data y no-autoridad transaccional.
