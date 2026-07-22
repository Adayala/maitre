# Contrato de evento — SPEC-169 ReputationUpdated

Publicar al materializar una nueva versión del score de reputación. El sobre versionado incluye
eventId, occurredAt, tenantId, branchId, period, formulaVersion y score/coverage sólo al superar
privacy threshold. SampleSize exacto se omite bajo threshold. Tests cubren recomputación, tardíos,
misma versión, duplicados, compatibilidad, supresión, correlación y aislamiento.
