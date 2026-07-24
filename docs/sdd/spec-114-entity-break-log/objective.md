# Objetivo — SPEC-114

Definir BreakLog como registro autoritativo de pausas dentro de una TimeEntry con clasificación
laboral congelada y ajustes append-only.

## Criterios de aceptación

### CAD-114-01 — BreakLog fija pertenencia, type, paid classification y policy version

pertenencia a TimeEntry, type, paid classification y policy version quedan definidos sin
ambigüedad.

### CAD-114-02 — El ciclo de vida OPEN/CLOSED y la unicidad de pausa abierta son inequívocos

el ciclo de vida OPEN/CLOSED y la restricción de una sola pausa abierta son inequívocos.

### CAD-114-03 — Los límites temporales frente a la jornada siguen policy explícita

límites temporales respecto de la jornada efectiva se validan por policy explícita.

### CAD-114-04 — Clock-out con pausa abierta sigue comportamiento normativo auditado

clock-out con pausa abierta tiene comportamiento normativo cerrado o auto-close auditado
según policy version.

### CAD-114-05 — BreakAdjustment preserva timestamps originales sin reescritura

BreakAdjustment conserva timestamps originales y recomputa proyecciones sin reescritura.

### CAD-114-06 — La aprobación exige evidencia de overlap, DST y ajustes

La aprobación exige fixtures de overlap, pause-open-at-clockout, DST, remuneración,
ajustes y aislamiento.
