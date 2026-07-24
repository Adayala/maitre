# Especificación — SPEC-193 Analytics API

Batch ingest sólo para producer identity registrada: schema/version, auth signature, size/rate,
clock tolerance, dedupe e idempotencia; respuesta por item ACCEPTED|DUPLICATE|QUARANTINED|REJECTED.
Tenant/subject no se confían al payload público.

Query series agregadas usa metrics publicadas, rango/cardinality/cost limits y devuelve timezone,
cursor, `asOf`, freshness, coverage y suppression. No expone raw events sin permiso separado.

`POST /analytics/events:batch-ingest` recibe lotes firmados de productores confiables; `GET
/analytics/series` y endpoints equivalentes consultan agregados basados en MetricDefinitions ya
publicadas. Errores distinguen productor no confiable, schema inválido, rate exceeded, item
quarantined y query demasiado costosa o cardinalidad excesiva.

La API separa claramente ingest observacional de lectura analítica. Incluso con permiso de lectura,
los consumidores no acceden automáticamente a raw events ni a subjects sensibles; la interfaz estándar
es la serie agregada con metadata de frescura y supresión.
