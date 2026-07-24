# Objetivo — SPEC-165

Definir la API de análisis de sentimiento como job idempotente, gobernado por privacidad, presupuesto
y versiones de modelo/prompt.

## Criterios de aceptación

### CAD-165-01 — El job es idempotente por revisión y versions exactas

el job es idempotente por text revision + language + model/prompt/redaction versions.

### CAD-165-02 — Baja confianza termina en `ABSTAINED`, no en label forzado

el lifecycle del job es `PENDING -> COMPLETED | ABSTAINED | FAILED`, y baja confianza
termina en `ABSTAINED`.

### CAD-165-03 — Antes del provider se validan base, clasificación, redacción y budget

antes de invocar provider se validan purpose/base, clasificación, redacción y budget
aprobado.

### CAD-165-04 — Texto sensible, prompts internos y secrets no salen del boundary

texto sensible no sale del boundary sin configuración aprobada; la respuesta no incluye
prompt interno ni provider secrets.

### CAD-165-05 — Administración de modelos/prompts usa permisos separados

la administración de modelos/prompts requiere permisos separados de la ejecución de
análisis.

### CAD-165-06 — La aprobación exige evidencia de abstain, budget y separación de permisos

La aprobación exige fixtures de idempotencia, abstain, budget guardrails, redaction,
provider failure y separación de permisos.
