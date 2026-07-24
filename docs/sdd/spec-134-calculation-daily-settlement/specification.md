# Especificación — SPEC-134 DailySettlement

Función pura por tenant, branch, business date/timezone, currency y ledger revision. Separa cash
journal de medios no-cash y reconcilia source identities con Payment para detectar faltantes o
duplicados.

Por sesión aplica la ecuación SPEC-126; por día suma openings, movements por type, expected,
counted, differences y late adjustments sin netear monedas. Resultado conserva input hash,
cutoffs, revisions y reason trace. Recalcular genera nueva versión; no muta un settlement cerrado.

El cálculo opera por `tenantId`, `branchId`, `businessDate`, `timezone`, `currency` y un conjunto
explícito de ledger revisions/cutoffs relevantes. Separa journal cash de medios no-cash, pero los
reconcilia por source identities con Payment para detectar faltantes, duplicados o inconsistencias
de integración.

La función no netea monedas entre sí ni mezcla business dates. El resultado declara openings,
movements por type, expected, counted, differences, late adjustments, input hash, calculation
version, cutoffs aplicados y trace de reglas. Cualquier recálculo produce una nueva versión
referenciable sin reescribir snapshots previos ya cerrados o exportados.
