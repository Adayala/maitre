# Objetivo — SPEC-194

Definir la API de métricas para crear, validar, previsualizar costo, evaluar y publicar definiciones
de forma gobernada.

## Criterios de aceptación

### CAD-194-01 — La API cubre draft, validate, preview-cost, evaluate, publish y deprecate

La API expone create DRAFT, validate, preview-cost, evaluate, publish/version y deprecate.

### CAD-194-02 — `If-Match` protege edición y `validate` resuelve refs, ciclos, tipos y límites

`If-Match` protege edición y `validate` resuelve registry refs, ciclos, types, units, permisos y
límites de recursos.

### CAD-194-03 — Preview usa datasets acotados, estima costo y no evade permisos

Preview usa dataset/range acotado, estima scans/cardinality/time y no evade permisos.

### CAD-194-04 — Evaluate aplica hard budget y timeout operativos

Evaluate aplica hard budget y timeout operativos.

### CAD-194-05 — Publish exige fixtures, owner, reviewer y lineage compatible

Publish exige golden fixtures, owner/reviewer y lineage compatible; una versión usada permanece
inmutable.

### CAD-194-06 — La aprobación exige evidencia de validación, costo, budget, lineage y deprecación

La aprobación exige fixtures de validación, preview cost, timeout/budget, publish gates, lineage y
deprecación.
