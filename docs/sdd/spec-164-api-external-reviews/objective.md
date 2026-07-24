# Objetivo — SPEC-164

Definir la API de reseñas externas con provenance, freshness y gestión local separada del contenido
remoto.

## Criterios de aceptación

### CAD-164-01 — List/detail exponen versiones con provenance, attribution y freshness bajo ToS

list/detail exponen versiones de reseñas con provenance, attribution y freshness bajo
permisos y límites ToS.

### CAD-164-02 — Comandos locales gestionan sólo el caso operativo

los comandos `acknowledge`, `assign`, `resolve`, `reopen` gestionan sólo el caso local y
no mutan contenido remoto por defecto.

### CAD-164-03 — Cualquier acción sobre provider remoto queda separada y autorizada aparte

cualquier capacidad para accionar sobre el provider remoto queda separada, explícita y
autorizada aparte.

### CAD-164-04 — Cambios remotos crean nuevas versiones y deletes remotos muestran tombstone

ediciones remotas generan nuevas versiones locales y deletes remotos muestran tombstone
preservando provenance.

### CAD-164-05 — Stale o outage nunca presentan contenido como actual

outage o freshness vencida devuelve dato stale marcado o unavailable, nunca contenido
presentado como actual.

### CAD-164-06 — La aprobación exige evidencia de tombstone, freshness y separación de capacidades

La aprobación exige fixtures de versionado remoto, tombstone, stale/outage, attribution y
separación entre gestión local y provider actions.
