# Especificación — SPEC-169 ReputationScoreUpdated

Se emite al materializar nueva score version. Incluye branch/window, formula version, coverage,
source buckets, `asOf` y score sólo si privacy threshold se cumple.

Sample size exacto jamás aparece bajo threshold; se omite o usa bucket aprobado. La misma regla
aplica a logs/metrics. Recompute idéntico no emite otro hecho; tardíos crean versión superior.
