# Objetivo — SPEC-047

## Propósito

Componer un resumen operacional acotado por tenant/sucursal con freshness y disponibilidad por
sección, sin inventar ceros ni redefinir métricas analíticas.

## Criterios de aceptación

### CAD-047-01 — `GET /v1/dashboard/overview` deriva tenant/alcance de sucursal y filtra secciones por permiso

`GET /v1/dashboard/overview` deriva tenant/alcance de sucursal y filtra secciones por permiso.

### CAD-047-02 — Cada sección declara status, asOf, freshness, revisión de fuente y métricas definidas

Cada sección declara status `AVAILABLE | PARTIAL | UNAVAILABLE`, asOf, freshness, revisión de fuente y
métricas con definición referenciada.

### CAD-047-03 — Dependencia fallida o timeout no produce cero y conserva otras secciones

Dependencia fallida/timeout no produce cero; devuelve estado/motivo explícitos por sección y conserva
otras secciones.

### CAD-047-04 — Ventanas como “24h” sólo se usan con metric definition/timezone/cutoff versionados

Ventanas como “24h” sólo se usan cuando metric definition/timezone/cutoff están versionados; overview
no inventa KPIs ad hoc.

### CAD-047-05 — La composición respeta budget, evita N+1, minimiza PII y usa cache/ETag

Composición respeta budget, evita N+1, minimiza PII y usa cache/ETag con desactualización visible.

### CAD-047-06 — Partial, stale, timeout, cache, alcance y aislamiento entre tenants poseen resultados verificables

Partial/stale/timeout/cache/alcance y aislamiento entre tenants poseen resultados verificables conforme a SPEC-216.
