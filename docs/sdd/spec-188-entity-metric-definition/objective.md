# Objetivo — SPEC-188

Definir MetricDefinition como DSL declarativa, gobernada y reproducible para métricas analíticas.

## Criterios de aceptación

### CAD-188-01 — La DSL referencia señales, fórmula, unidad, grain, dimensiones y versión

La DSL refiere signal IDs del DataRegistry, formula, unit, grain, dimensions, window, timezone, owner
y version.

### CAD-188-02 — La DSL bloquea código arbitrario, red, recursión y joins fuera de allowlist

La DSL no admite código arbitrario, red, recursión ni joins fuera de allowlist.

### CAD-188-03 — El sandbox limita rango, joins, scanned rows, cardinality, memoria y tiempo

El sandbox limita range, joins allowlisted, scanned rows, cardinality, memory y time.

### CAD-188-04 — Preview estima costo y reaplica permisos a inputs y dimensiones

Preview estima costo antes de ejecutar y aplica permisos a inputs y dimensions.

### CAD-188-05 — Publish congela semántica y cambios incompatibles crean nueva versión

Publish congela semántica; cambios incompatibles crean nuevo metric ID/version con lineage y golden
fixtures.

### CAD-188-06 — La aprobación exige evidencia de DSL, sandbox, costo, freeze y lineage

La aprobación exige fixtures de formulas, sandbox limits, preview cost, publish freeze, lineage y
golden fixtures.
