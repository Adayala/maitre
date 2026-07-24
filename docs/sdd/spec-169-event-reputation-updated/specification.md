# Especificación — SPEC-169 ReputationScoreUpdated

Se emite al materializar nueva score version. Incluye branch/window, formula version, coverage,
source buckets, `asOf` y score sólo si privacy threshold se cumple.

Sample size exacto jamás aparece bajo threshold; se omite o usa bucket aprobado. La misma regla
aplica a logs/metrics. Recompute idéntico no emite otro hecho; tardíos crean versión superior.

El evento es apto para alimentar dashboards, caches e invalidación de vistas derivadas. No es apto
para reidentificación ni para inferir tamaños precisos cuando rige supresión. `coverage` y
`sourceBuckets` permiten interpretar la confiabilidad sin exponer muestras exactas no permitidas.

La identidad lógica del evento combina `scopeRef`, `window`, `formulaVersion`, `asOf` y `scoreVersion`.
Si no cambia ninguno de esos componentes materiales, no debe publicarse un nuevo evento aunque el job
de recomputación se haya reejecutado.
