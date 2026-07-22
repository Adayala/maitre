# Especificación — SPEC-160 SentimentAnalysis

Resultado sobre una text revision exacta: label, confidence, language, provider/model/prompt version,
input hash, redaction policy y evaluatedAt. Bajo threshold produce `UNDETERMINED`, no fuerza label.

Provider externo requiere base/purpose, no-retention contractual, residencia aprobada, redacción,
budget y eval PASS por idioma/segmento. El análisis no reemplaza texto, publica respuestas ni toma
acciones laborales/alto impacto. Reprocesar crea versión nueva y conserva comparación.
