# Especificación — SPEC-197 ML Models API

Register/evaluate/compare/approve/activate/rollback/retire. Register valida artifact/hash y lineage;
evaluate fija dataset snapshot, environment y metrics. Approval usa actor segregado.

Activate exige eval thresholds, privacy/bias review, runtime/cost spike PASS, monitoring y rollback.
Race permite una ACTIVE por purpose/scope. Rollback es command auditado y no borra predictions.
