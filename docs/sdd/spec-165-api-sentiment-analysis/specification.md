# Especificación — SPEC-165 Sentiment Analysis API

Job idempotente por text revision + language + model/prompt/redaction versions. Estados
`PENDING -> COMPLETED | ABSTAINED | FAILED`; baja confianza termina ABSTAINED.

Antes de provider valida purpose/base, clasificación, redacción y budget. Texto sensible no sale
sin configuración aprobada. Response expone confidence, versions y limitations; no incluye prompt
interno ni provider secrets. Administración de modelos requiere permiso separado.
