# Especificación — SPEC-197

Register/evaluate/compare/approve/activate/rollback/retire. `Register` valida artifact/hash y lineage;
`evaluate` fija dataset snapshot, environment y métricas. `Approval` usa actor segregado.

`Activate` exige eval thresholds, privacy/bias review, runtime/cost spike `PASS`, monitoring y rollback.
La carrera permite una `ACTIVE` por purpose/alcance. `Rollback` es comando auditado y no borra predictions.

`POST /ml-models` registra una versión candidata; `POST /ml-models/{modelVersionId}:evaluate|compare|
approve|activate|rollback|retire` gobierna su ciclo de vida. `GET /ml-models/{modelVersionId}` devuelve
provenance, métricas, reviews y estado. Errores distinguen gates faltantes, segregación inválida,
conflicto de alcance y artifact/lineage inconsistente.

La activación es una transición operacional con impacto de serving, no un simple cambio de etiqueta.
Por eso requiere monitoring, rollback target y asegurar exclusividad `ACTIVE` por purpose/alcance antes
de hacer visible la nueva versión al runtime.
