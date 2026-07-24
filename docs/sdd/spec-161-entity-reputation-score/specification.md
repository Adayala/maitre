# Especificación — SPEC-161 ReputationScore

Para observaciones normalizadas `x_i` en `[0,1]`, peso `w_i = sourceWeight * recencyWeight *
confidenceWeight`; `score = sum(w_i*x_i)/sum(w_i)`. Recency usa función/version publicada y los
pesos por fuente suman de forma declarada; no se imputan fuentes ausentes.

Se publica score `[0,100]`, coverage, source buckets, window, formula version, `asOf` e intervalo de
incertidumbre. Edición/borrado recompone nueva versión. Outliers sólo se limitan mediante regla
versionada, nunca eliminación silenciosa. Si sample efectivo/coverage no alcanza threshold se
suprimen score y tamaño exacto, usando bucket permitido.

La entidad incluye `reputationScoreId`, `scopeRef`, `window`, `formulaVersion`, `sourceBuckets`,
`coverage`, `effectiveSampleBucket`, `score?`, `uncertaintyInterval?`, `suppressionReason?`, `asOf`,
`computedAt`, `inputSetHash` y `revision`. `score` puede estar ausente cuando la política de
privacidad o insuficiencia estadística exige supresión.

El agregado no es editable manualmente. Cada recomputación basada en cambios de inputs, fórmula o
políticas de privacidad produce nueva revisión con trazabilidad completa a los parámetros usados.
Consumers downstream deben poder distinguir “sin score por supresión” de “score bajo”.
