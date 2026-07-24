# Objetivo — SPEC-099

Definir Station como centro de producción configurable por Branch con routing determinístico y
lifecycle seguro frente a trabajo activo.

## Criterios de aceptación

### CAD-099-01 — Station define identidad, alcance operativo y code único por Branch

identidad, alcance operativo, code único y capabilities de Station quedan definidos con claridad.

### CAD-099-02 — El routing de Station se resuelve de forma determinística

RoutingPolicy versionada, prioridad y specificity producen resolución determinística sin
empates publicables.

### CAD-099-03 — Cada Command congela station, routing revision y reason

cada Command congela station, routing revision y razón de ruteo al asignarse.

### CAD-099-04 — Inactivar o archivar una Station exige cero trabajo activo o transferencia

inactivar o archivar una Station exige cero trabajo no terminal o transferencia atómica
compatible.

### CAD-099-05 — Station no absorbe autoridad de cola ni observabilidad derivada

Station no mezcla autoridad de configuración con cola mutable u observabilidad derivada.

### CAD-099-06 — La aprobación exige evidencia de routing, reroute e inactivación

La aprobación exige fixtures de overlapping rules, empate ambiguo, reroute, inactivación y
aislamiento.
