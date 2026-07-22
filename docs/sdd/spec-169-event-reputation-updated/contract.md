# Contrato de evento — SPEC-169 ReputationUpdated

Publicar al materializar una nueva versión del score de reputación. El sobre versionado incluye
eventId, occurredAt, tenantId, branchId, period, score, scale, sampleSize, coverage y
formulaVersion, sin observaciones individuales. Tests cubren recomputación, eventos tardíos,
misma versión, duplicados, compatibilidad, supresión, correlación y aislamiento.
