# Objetivo — SPEC-191

Definir MLModel Registry como fuente reproducible, gobernada y segregada de versiones de modelo.

## Criterios de aceptación

### CAD-191-01 — `ModelVersion` conserva provenance completa, métricas segmentadas y reviews

`ModelVersion` conserva purpose, artifact/hash, code/config, environment, seed, dataset snapshot/hash,
feature registry versions, metrics por segmento, thresholds, privacy/bias review, limitations y owner.

### CAD-191-02 — El ciclo de vida define candidate, evaluated, approved, active y retired

El ciclo de vida es `CANDIDATE -> EVALUATED -> APPROVED -> ACTIVE -> RETIRED`.

### CAD-191-03 — Evaluator y approver están segregados

Evaluator y approver están segregados.

### CAD-191-04 — `Activate` exige reproducibilidad, rollout seguro, monitoring y rollback

`Activate` exige reproducibilidad, gates, shadow/canary plan, monitoring, budget y rollback target.

### CAD-191-05 — Sólo puede haber una versión `ACTIVE` por purpose y alcance

Sólo puede haber una versión `ACTIVE` por purpose/alcance y las artifact refs firmadas no sustituyen la
provenance completa.

### CAD-191-06 — La aprobación exige evidencia de reproducibilidad, sesgo, canary y segregación

La aprobación exige fixtures de reproducibilidad, segment metrics, bias/privacy review, canary/rollback
y segregación de aprobación.
