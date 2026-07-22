# Especificación — SPEC-191 MLModel Registry

ModelVersion conserva purpose, artifact/hash, code/config, environment, seed, dataset snapshot/hash,
feature registry versions, metrics por segmento, thresholds, privacy/bias review, limitations y
owner. Lifecycle `CANDIDATE -> EVALUATED -> APPROVED -> ACTIVE -> RETIRED`.

Evaluator y approver son segregados. Activate requiere reproducibilidad/gates, shadow/canary plan,
monitoring, budget y rollback target. Una versión ACTIVE por purpose/scope; artifact references son
firmadas pero no sustituyen provenance completa.
