# Contrato de evento — SPEC-205 MetricUpdated

Publicar al materializar una métrica nueva para tenant, sucursal, definición, versión, período
y dimensiones permitidas. El sobre incluye eventId, occurredAt, value, unit, coverage y
freshness, sin PII. Tests cubren recomputación, eventos tardíos, duplicados, compatibilidad,
supresión, correlación y aislamiento.
