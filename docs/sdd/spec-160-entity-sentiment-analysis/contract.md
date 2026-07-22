# Contrato de entidad — SPEC-160 Sentiment Analysis

SentimentAnalysis registra resultado, confianza, idioma, etiquetas, modelo/prompt versionados
y timestamp sobre una versión exacta de texto. No reemplaza la opinión original ni toma
acciones automáticas de alto impacto; baja confianza queda explícita. Tests cubren texto vacío,
idiomas, contenido adversarial, cambio de modelo, reproducibilidad, redacción previa,
privacidad, sesgo y aislamiento entre tenants.
