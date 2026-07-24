# Reglas — SPEC-166

- Todas las vistas publican freshness, coverage y versions explícitas.
- Comparaciones incompatibles no se mezclan.
- Supresión y bucketing se aplican antes del cache y drill-down.
- No se devuelve texto, autor ni sample exacto suprimido.
- Cache key aísla tenant, scopes, fórmula/modelo y suppression policy.
