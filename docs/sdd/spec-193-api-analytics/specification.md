# Especificación — SPEC-193 Analytics API

Batch ingest sólo para producer identity registrada: schema/version, auth signature, size/rate,
clock tolerance, dedupe e idempotencia; respuesta por item ACCEPTED|DUPLICATE|QUARANTINED|REJECTED.
Tenant/subject no se confían al payload público.

Query series agregadas usa metrics publicadas, rango/cardinality/cost limits y devuelve timezone,
cursor, `asOf`, freshness, coverage y suppression. No expone raw events sin permiso separado.
