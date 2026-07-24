# Especificación — SPEC-191 MLModel Registry

ModelVersion conserva purpose, artifact/hash, code/config, environment, seed, dataset snapshot/hash,
feature registry versions, metrics por segmento, thresholds, privacy/bias review, limitations y
owner. El ciclo de vida es `CANDIDATE -> EVALUATED -> APPROVED -> ACTIVE -> RETIRED`.

Evaluator y approver son segregados. Activate requiere reproducibilidad/gates, shadow/canary plan,
monitoring, budget y rollback target. Una versión ACTIVE por purpose/alcance; artifact references son
firmadas pero no sustituyen provenance completa.

La entidad incluye `mlModelVersionId`, `purpose`, `scope`, `artifactRef`, `artifactHash`, `codeRef`,
`configHash`, `environmentRef`, `seed`, `datasetSnapshotRef`, `datasetHash`,
`featureRegistryVersions`, `segmentMetrics`, `thresholds`, `privacyReviewRef`, `biasReviewRef`,
`limitations`, `owner`, `status`, `version`, `createdAt`, `updatedAt` y `revision`.

El registro separa claramente evidencia de entrenamiento/evaluación de evidencia operacional de
despliegue. Que un artifact esté firmado no alcanza para explicar cómo fue producido, evaluado o bajo
qué limitaciones puede usarse.
