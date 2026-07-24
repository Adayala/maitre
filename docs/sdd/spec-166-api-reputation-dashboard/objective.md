# Objetivo — SPEC-166

Definir la API de dashboard reputacional como vista agregada, comparable y privacy-safe sobre métricas
y señales derivadas.

## Criterios de aceptación

### CAD-166-01 — La API expone métricas, trends, distributions y themes con metadata completa

la API expone métricas, trends, distributions y themes por branch/source/window con
timezone, `asOf`, freshness, coverage, formula/model versions e incertidumbre.

### CAD-166-02 — Comparaciones sólo se permiten entre configuraciones compatibles

comparaciones sólo se permiten entre configuraciones compatibles; de lo contrario se
muestran series separadas o incompatibilidad explícita.

### CAD-166-03 — Thresholds y bucketing se aplican antes del cache y en drill-down

privacy threshold y bucketing se aplican antes del cache y en cada drill-down.

### CAD-166-04 — La API suprime texto, autor y sample exacto cuando corresponde

la API no devuelve texto, autor ni sample exacto cuando la política exige supresión.

### CAD-166-05 — La cache key aísla tenant, scopes, fórmula/modelo y suppression policy

la cache key incluye tenant, scopes, formula/model y suppression policy para evitar
contaminación entre vistas.

### CAD-166-06 — La aprobación exige evidencia de comparabilidad, cache isolation y supresión

La aprobación exige fixtures de comparabilidad, cache isolation, supresión, freshness,
timezones y drill-down seguro.
