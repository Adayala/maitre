# Objetivo — SPEC-160

Definir SentimentAnalysis como resultado versionado y evaluable sobre una revisión exacta de texto,
sin convertirlo en verdad autoritativa ni en base para decisiones de alto impacto.

## Criterios de aceptación

### CAD-160-01 — Cada análisis referencia una revisión exacta por hash y metadata de ejecución

cada análisis referencia una text revision exacta mediante input hash, language,
provider/model/prompt version y evaluatedAt.

### CAD-160-02 — Thresholds versionados producen `UNDETERMINED` bajo confianza insuficiente

label y confidence se interpretan bajo thresholds versionados; bajo threshold el resultado
es `UNDETERMINED`.

### CAD-160-03 — Uso de provider externo exige base, residencia, redacción y eval aprobados

uso de provider externo exige purpose/base válidos, no-retention contractual, residencia
aprobada, redacción, budget y eval PASS por idioma/segmento.

### CAD-160-04 — El análisis no reemplaza texto ni soporta decisiones de alto impacto

el análisis no reemplaza el texto fuente, no publica respuestas y no toma acciones
laborales ni decisiones de alto impacto.

### CAD-160-05 — Reprocesar crea nueva versión comparable y trazable

reprocesar crea una nueva versión comparable y conserva trazabilidad entre modelos, prompts
y thresholds.

### CAD-160-06 — La aprobación exige evidencia de thresholds, idiomas y comparativas

La aprobación exige fixtures de thresholds, idiomas, redacción, proveedores,
reprocesamiento y evaluación comparativa.
