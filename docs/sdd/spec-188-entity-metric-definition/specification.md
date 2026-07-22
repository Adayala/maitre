# Especificación — SPEC-188 MetricDefinition

DSL declarativa refiere signal IDs del DataRegistry, formula, unit, grain, dimensions, window,
timezone, owner y version. No admite código, red, recursion ni joins arbitrarios.

Sandbox limita range, joins allowlisted, scanned rows, cardinality, memory y time. Preview estima
cost antes de ejecutar y aplica permisos a inputs/dimensions. Publish congela semántica; cambios
incompatibles crean nuevo metric ID/version con lineage y golden fixtures.
