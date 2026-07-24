# Especificación — SPEC-194 Metrics API

Create DRAFT, validate, preview-cost, evaluate, publish/version/deprecate. `If-Match` protege edición.
Validate resuelve registry refs, ciclos, types, units, permissions y resource limits.

Preview usa dataset/range acotado, estima scans/cardinality/time y no evade permisos. Evaluate
aplica hard budget/timeout. Publish exige golden fixtures, owner/reviewer y compatible lineage;
version usada permanece inmutable.

`POST /metrics` crea drafts; `POST /metrics/{metricId}:validate|preview-cost|evaluate|publish|deprecate`
ejecuta comandos sobre una definición; `GET /metrics/{metricId}` devuelve detalle y lineage. Errores
usan `404` para alcance ajeno, `409` para conflicto de ciclo de vida, `412` para revisión obsoleta y `422` para
DSL, permissions o resource limits inválidos.

La API distingue claramente prevalidación estática de evaluación real. `preview-cost` no materializa
la métrica completa ni genera resultados persistentes; `evaluate` sí puede producir evidencia de
ejecución, siempre dentro del budget y timeout aprobados.
