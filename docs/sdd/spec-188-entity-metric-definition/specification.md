# Especificación — SPEC-188 MetricDefinition

DSL declarativa refiere signal IDs del DataRegistry, formula, unit, grain, dimensions, window,
timezone, owner y version. No admite código, red, recursion ni joins arbitrarios.

Sandbox limita range, joins allowlisted, scanned rows, cardinality, memory y time. Preview estima
cost antes de ejecutar y aplica permisos a inputs/dimensions. Publish congela semántica; cambios
incompatibles crean nuevo metric ID/version con lineage y golden fixtures.

La entidad incluye `metricDefinitionId`, `registrySignalRefs`, `dsl`, `unit`, `grain`, `dimensions`,
`windowPolicy`, `timezone`, `owner`, `status`, `version`, `lineageRef?`, `goldenFixtureSetRef`,
`createdAt`, `updatedAt` y `revision`. `status` distingue drafts experimentales de definiciones
publicadas y consumibles por dashboards/alerts.

Una métrica publicada debe ser evaluable de forma determinística dentro de los límites del sandbox.
Los permisos aplican no sólo a la métrica final sino a cada dimensión y fuente subyacente para evitar
derivaciones no autorizadas de datos sensibles.
