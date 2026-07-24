# Objetivo — SPEC-100

Definir ProductionQueue como proyección reconstruible y determinística de Commands por Station, con
priorización auditada y protección contra starvation.

## Criterios de aceptación

### CAD-100-01 — ProductionQueue es un read model reconstruible, no autoridad mutativa

la cola queda definida como read model reconstruible, nunca como autoridad de mutación.

### CAD-100-02 — Orden, desempates y freshness metadata son inequívocos

orden estable, desempates y freshness metadata son inequívocos.

### CAD-100-03 — Reprioritization ocurre sólo por comando auditado

reprioritization se expresa como comando autoritativo auditado, no edición manual de
posiciones.

### CAD-100-04 — Aging y límites de boost previenen starvation sostenida

aging, límites de boost y expiración de prioridad evitan starvation sostenida.

### CAD-100-05 — Duplicados, reorder y rebuild convergen al mismo orden

duplicados, reorder y rebuild convergen al mismo orden observable.

### CAD-100-06 — La aprobación exige evidencia de ties, reprioritization y aging

La aprobación exige fixtures de ties, stale views, reprioritization, aging, cancellation y
aislamiento.
