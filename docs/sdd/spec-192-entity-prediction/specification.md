# Especificación — SPEC-192 Prediction

Inmutable: model version, feature snapshot/hash, generatedAt, horizon/expiry, result, uncertainty,
baseline, explanation y abstention reason. No es hecho observado.

Faltan features, coverage/confidence baja, model inactive, drift o budget agotado => ABSTAINED, no
resultado inventado. PII no se copia; refs se autorizan al leer. Expirada queda visible como
historia pero nunca alimenta decisión/automation actual.

La entidad incluye `predictionId`, `modelVersionRef`, `featureSnapshotRef`, `featureHash`,
`generatedAt`, `predictionHorizon`, `expiresAt`, `result?`, `uncertainty`, `baseline?`,
`explanationRef?`, `status`, `abstentionReason?`, `subjectRef?` y `revision`. `status` distingue
predicciones emitidas de abstenciones explícitas.

La predicción puede usarse como insumo asistivo sólo mientras esté vigente y dentro de las limitaciones
de su modelo/version. Su persistencia histórica sirve para auditoría y evaluación posterior, no para
retrojustificar decisiones actuales una vez expirada o superada por una versión nueva.
