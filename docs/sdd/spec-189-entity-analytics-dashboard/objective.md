# Objetivo — SPEC-189

Definir AnalyticsDashboard como composición versionada de métricas publicadas, con sharing que nunca
amplía permisos.

## Criterios de aceptación

### CAD-189-01 — El dashboard versionado refiere métricas publicadas, filtros, layout y audience

Dashboard versionado refiere MetricDefinitions publicadas, filtros allowlisted, layout, audiencia y
alcance por sucursal.

### CAD-189-02 — Publicar congela refs y versiones de métricas y layout

Publicar congela refs y versiones de métricas/layout.

### CAD-189-03 — Compartir nunca amplía permisos sobre métricas o dimensiones subyacentes

Compartir el dashboard nunca amplía permisos sobre métricas o dimensiones subyacentes.

### CAD-189-04 — Cada widget reaplica autorización y privacy threshold

Cada widget reaplica autorización y privacy threshold, devolviendo freshness, coverage y error propio.

### CAD-189-05 — Un widget puede degradar sin romper todo el dashboard y cache aísla contexto

Un widget puede degradar sin fallar todo el dashboard; cache key incluye tenant, alcances, metric
versions, filters y suppression policy.

### CAD-189-06 — La aprobación exige evidencia de sharing, degradación, aislamiento y thresholds

La aprobación exige fixtures de sharing, widget degradation, cache isolation, metric version freeze y
privacy thresholds.
