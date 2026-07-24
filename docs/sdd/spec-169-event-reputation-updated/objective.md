# Objetivo — SPEC-169

Definir el evento de actualización reputacional como señal agregada, versionada y sujeta a supresión
por privacidad.

## Criterios de aceptación

### CAD-169-01 — El evento se emite sólo al materializar una nueva score version reputacional

el evento se emite al materializar una nueva score version reputacional.

### CAD-169-02 — El payload incluye score sólo si el privacy threshold se cumple

el payload incluye branch/window, formula version, coverage, source buckets, `asOf` y
score sólo si el privacy threshold se cumple.

### CAD-169-03 — Sample size exacto y otros indicadores sensibles se suprimen o bucketean

sample size exacto y otros indicadores sensibles jamás aparecen bajo threshold; se omiten
o se bucketean según política aprobada.

### CAD-169-04 — La misma supresión aplica en eventos, logs y métricas derivadas

la misma política de supresión aplica a eventos, logs y métricas derivadas.

### CAD-169-05 — Recompute idéntico no reemite; cambios reales crean versión superior

un recompute idéntico no emite otro hecho; inputs tardíos o cambios reales crean una
versión superior.

### CAD-169-06 — La aprobación exige evidencia de supresión, recompute y coverage/freshness

La aprobación exige fixtures de supresión, recompute idéntico, versión superior, ordering
y propagación de coverage/freshness.
