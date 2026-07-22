# Especificación — SPEC-166 Reputation Dashboard API

Métricas/trends/distributions/themes por branch/source/window con timezone, `asOf`, freshness,
coverage, formula/model versions e incertidumbre. Comparaciones sólo entre configuraciones
compatibles; de lo contrario se muestran series separadas.

Privacy threshold y bucketing se aplican antes del cache y en cada drill-down. No se devuelve texto,
autor o sample exacto suprimido. Cache key incluye tenant, scopes, formula y suppression policy.
