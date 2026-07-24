# Especificación — SPEC-166 Reputation Dashboard API

Métricas/trends/distributions/themes por branch/source/window con timezone, `asOf`, freshness,
coverage, formula/model versions e incertidumbre. Comparaciones sólo entre configuraciones
compatibles; de lo contrario se muestran series separadas.

Privacy threshold y bucketing se aplican antes del cache y en cada drill-down. No se devuelve texto,
autor o sample exacto suprimido. Cache key incluye tenant, scopes, formula y suppression policy.

`GET /reputation-dashboard/overview`, `:trends`, `:distributions` y `:themes` exponen vistas
agregadas especializadas. Cada respuesta incluye metadata explícita de `asOf`, `freshness`,
`coverage`, `formulaVersion`, `modelVersion?`, `suppressionPolicyVersion` y timezone efectiva. La API
debe diferenciar entre “sin datos”, “datos suprimidos” y “datos incompatibles para comparación”.

Los drill-downs sólo pueden bajar hasta el nivel permitido por los thresholds de privacidad; si un
widget o corte temporal queda por debajo del umbral, responde con buckets agregados o supresión. El
cache no puede almacenar una vista menos suprimida y reutilizarla para un actor o combinación de
scopes distinta.
