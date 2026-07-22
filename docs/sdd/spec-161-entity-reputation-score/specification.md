# Especificación — SPEC-161 ReputationScore

Para observaciones normalizadas `x_i` en `[0,1]`, peso `w_i = sourceWeight * recencyWeight *
confidenceWeight`; `score = sum(w_i*x_i)/sum(w_i)`. Recency usa función/version publicada y los
pesos por fuente suman de forma declarada; no se imputan fuentes ausentes.

Se publica score `[0,100]`, coverage, source buckets, window, formula version, `asOf` e intervalo de
incertidumbre. Edición/borrado recompone nueva versión. Outliers sólo se limitan mediante regla
versionada, nunca eliminación silenciosa. Si sample efectivo/coverage no alcanza threshold se
suprimen score y tamaño exacto, usando bucket permitido.
