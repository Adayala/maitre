# Objetivo — SPEC-048

## Propósito

Proveer una superficie administrativa accesible y portable para setup, overview y configuración
autorizada, reflejando estados partial/stale/error sin replicar reglas de dominio.

## Criterios de aceptación

### CAD-048-01 — La app consume APIs/versiones aprobadas y no decide autorización ni métricas por lógica cliente

La app consume APIs/versiones aprobadas y nunca accede DB ni decide autorización, readiness o métricas
por lógica cliente.

### CAD-048-02 — Setup renderiza item codes/status/reasons/actions del backend

Setup renderiza item codes/status/reasons/actions del backend y no persiste “completado” por click.

### CAD-048-03 — Overview representa AVAILABLE/PARTIAL/UNAVAILABLE, asOf/freshness y retry sin inventar ceros

Overview representa AVAILABLE/PARTIAL/UNAVAILABLE, asOf/freshness y retry sin convertir missing/error
en cero.

### CAD-048-04 — Loading, empty, error, forbidden, not-found y stale poseen UX no enumerable

Loading/empty/error/forbidden/not-found/stale poseen UX no enumerable y mantienen layout/focus.

### CAD-048-05 — Accesibilidad y responsive se verifican en rutas críticas

Navegación teclado, landmarks, contraste WCAG 2.2 AA, focus y touch targets se verifican en rutas
críticas/responsive.

### CAD-048-06 — Tokens, secrets y PII no aparecen en URL, logs, analytics o bundle

Tokens/secrets/PII no aparecen en URL/logs/analytics/bundle; cache offline, si existe, es read-only
y stale explícita.
