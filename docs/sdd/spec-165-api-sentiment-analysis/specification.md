# Especificación — SPEC-165 Sentiment Analysis API

Job idempotente por text revision + language + model/prompt/redaction versions. Estados
`PENDING -> COMPLETED | ABSTAINED | FAILED`; baja confianza termina ABSTAINED.

Antes de provider valida purpose/base, clasificación, redacción y budget. Texto sensible no sale
sin configuración aprobada. Response expone confidence, versions y limitations; no incluye prompt
interno ni provider secrets. Administración de modelos requiere permiso separado.

`POST /sentiment-analyses` solicita o reutiliza un job para una revisión exacta; `GET
/sentiment-analyses/{analysisId}` devuelve estado, versions, confidence y limitations; endpoints de
administración de modelos/policies viven por separado y bajo permisos superiores. `404` oculta
subjects fuera de scope, `409` cubre conflictos de estado, `412` revisiones obsoletas y `422`
configuración o input no aprobados.

La respuesta funcional debe dejar claro que el resultado es asistivo y no autoritativo. `FAILED`
distingue problemas operativos de `ABSTAINED`, que expresa falta de confianza suficiente con pipeline
correctamente ejecutado.
