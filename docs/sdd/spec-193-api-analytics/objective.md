# Objetivo — SPEC-193

Definir la API de analytics para ingest batch seguro y consulta agregada basada en métricas publicadas.

## Criterios de aceptación

### CAD-193-01 — Batch ingest acepta sólo productores registrados con firma, schema y límites válidos

Batch ingest sólo acepta producer identity registrada con schema/version, auth signature, size/rate,
clock tolerance, dedupe e idempotencia.

### CAD-193-02 — La respuesta de ingest es por item con estados explícitos

La respuesta de ingest es por item con `ACCEPTED|DUPLICATE|QUARANTINED|REJECTED`.

### CAD-193-03 — Tenant y subject nunca se confían al payload público

Tenant y subject nunca se confían al payload público; se derivan/validan por identidad del productor.

### CAD-193-04 — Query agregada usa métricas publicadas y límites de rango, cardinalidad y costo

Query de series agregadas usa métricas publicadas y aplica límites de rango, cardinalidad y costo.

### CAD-193-05 — Las respuestas publican metadata de frescura y no exponen raw events sin permiso

Las respuestas devuelven timezone, cursor, `asOf`, freshness, coverage y suppression y no exponen raw
events sin permiso separado.

### CAD-193-06 — La aprobación exige evidencia de ingest por item, dedupe, quarantine y supresión

La aprobación exige fixtures de ingest por item, dedupe, quarantine, producer trust, límites de query
y supresión.
