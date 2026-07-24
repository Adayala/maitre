# Especificación — SPEC-160 SentimentAnalysis

Resultado sobre una text revision exacta: label, confidence, language, provider/model/prompt version,
input hash, redaction policy y evaluatedAt. Bajo threshold produce `UNDETERMINED`, no fuerza label.

Provider externo requiere base/purpose, no-retention contractual, residencia aprobada, redacción,
budget y eval PASS por idioma/segmento. El análisis no reemplaza texto, publica respuestas ni toma
acciones laborales/alto impacto. Reprocesar crea versión nueva y conserva comparación.

La entidad incluye `analysisId`, `subjectType`, `subjectId`, `inputHash`, `language`, `label`,
`confidence`, `thresholdVersion`, `provider`, `model`, `promptVersion`, `redactionPolicyVersion`,
`evaluationSuiteVersion`, `evaluatedAt`, `comparisonOf?`, `purpose`, `treatmentBasis` y `revision`.
El input original no se duplica dentro del resultado; se referencia por hash y por la entidad fuente.

Las comparaciones entre versiones deben poder explicar por qué cambió un resultado: modelo, prompt,
threshold o redaction policy. Los consumers downstream deben tratar `UNDETERMINED` como ausencia de
señal confiable, no como neutralidad forzada.
