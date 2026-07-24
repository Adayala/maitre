# Objetivo — SPEC-032

## Propósito

Exponer una vista de sólo lectura de capacidad efectiva y consumo para el contexto autorizado, claramente
marcada como proyección informativa y no como autoridad de admisión.

## Criterios de aceptación

### CAD-032-01 — `GET /v1/entitlements` deriva tenant y contexto server-side

`GET /v1/entitlements` deriva tenant/contexto server-side y nunca acepta un tenantId arbitrario como
autoridad.

### CAD-032-02 — La respuesta unifica Entitlements tipados y Quotas asociadas sin mezclar capacidad con consumo

La respuesta unifica Entitlements tipados y Quotas asociadas por code/alcance sin mezclar capacidad con
consumo.

### CAD-032-03 — Filtros, orden estable y ETag identifican una revisión de cálculo exacta

Filtros por code/alcance de sucursal, orden estable y ETag identifican una revisión de cálculo exacta.

### CAD-032-04 — Ausencia, suspensión y fuente stale se representan explícitamente

Ausencia, suspensión y fuente stale se representan explícitamente; no se infiere unlimited ni se
amplía capacidad.

### CAD-032-05 — La proyección puede servir a UI o cache pero toda mutación consulta la fuente autoritativa

La proyección puede servir a UI/cache, pero toda mutación consulta la fuente autoritativa y revalida
Quota.

### CAD-032-06 — Redacción, conditional GET, alcances y cross-tenant poseen evidencia sin términos innecesarios

Redacción, conditional GET, alcances y cross-tenant poseen evidencia sin exponer términos comerciales
innecesarios.
