# Objetivo — SPEC-197

Definir la API de modelos ML con registro, evaluación, aprobación y activación gobernadas por
segregación y rollout seguro.

## Criterios de aceptación

### CAD-197-01 — La API cubre register, evaluate, compare, approve, activate, rollback y retire

La API expone register, evaluate, compare, approve, activate, rollback y retire.

### CAD-197-02 — Register y evaluate validan artifact, lineage, dataset snapshot y environment

Register valida artifact/hash y lineage; evaluate fija dataset snapshot, environment y métricas
reproducibles.

### CAD-197-03 — Approval usa actor segregado respecto de quien evalúa

Approval usa actor segregado respecto de quien evalúa.

### CAD-197-04 — Activate exige thresholds, reviews, spike `PASS`, monitoring y rollback

Activate exige eval thresholds, privacy/bias review, runtime/cost spike `PASS`, monitoring y rollback
target.

### CAD-197-05 — Una sola versión `ACTIVE` por purpose y alcance; rollback no borra historia

La carrera de activación garantiza una sola `ACTIVE` por purpose/alcance y rollback es command auditado
que no borra predicciones históricas.

### CAD-197-06 — La aprobación exige evidencia de ciclo de vida, segregación, exclusividad y rollback

La aprobación exige fixtures de register/evaluate/approve/activate, segregación, unicidad de activo,
rollback y retire.
