# Objetivo — SPEC-103

Definir la API de configuración de Stations con versionado, unicidad por Branch y cambios de estado
seguros frente a trabajo activo.

## Criterios de aceptación

### CAD-103-01 — La API de Stations delimita CRUD y comandos con scope por Branch

CRUD y comandos de configuración/estado quedan definidos con scope claro por Branch.

### CAD-103-02 — Code único, `If-Match` y revisiones previenen conflictos

unicidad de code, `If-Match` y revisiones protegen contra conflictos y lost updates.

### CAD-103-03 — Publish-routing rechaza ambigüedad y destinos incompatibles

publicación de RoutingPolicy rechaza ambigüedad, destinos inválidos o stations
incompatibles.

### CAD-103-04 — Deactivate exige vacío autoritativo o transferencia atómica

deactivate exige cola autoritativa vacía o transferencia atómica validada.

### CAD-103-05 — La API conserva historia y before/after auditables

la API no permite borrar historia ni esconder before/after en cambios sensibles.

### CAD-103-06 — La aprobación exige evidencia de unicidad, reroute y deactivate

La aprobación exige fixtures de unicidad, concurrencia, reroute, deactivate, audit y
aislamiento.
