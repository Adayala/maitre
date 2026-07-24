# Objetivo — SPEC-121

Definir una proyección pura y explicable de payroll sobre intervalos aprobados y policy versionada,
sin afirmar cumplimiento legal ni liquidación final.

## Criterios de aceptación

### CAD-121-01 — Inputs aprobados, policy version y adjustment chain quedan definidos sin ambigüedad

inputs aprobados, policy version, timezone IANA y adjustment chain quedan definidos sin
ambigüedad.

### CAD-121-02 — El cálculo es puro, determinista y decimal con trazabilidad completa

el cálculo es puro, determinista y usa aritmética decimal con trazabilidad de razones y
redondeos.

### CAD-121-03 — El resultado distingue categorías y provenance de reglas aplicadas

resultado distingue minutos regulares, pausas, extras, nocturnidad y provenance de reglas
aplicadas.

### CAD-121-04 — Nuevas correcciones crean nuevas projections sin reescribir exportados

nuevas correcciones crean nuevas projections vinculadas sin reescribir exportados.

### CAD-121-05 — `NOT_CONFIGURED` bloquea afirmaciones silenciosas sin policy aplicable

`NOT_CONFIGURED` bloquea afirmaciones silenciosas cuando falta policy aplicable.

### CAD-121-06 — La aprobación exige evidencia de DST, feriados, retroactivos y reconciliación

La aprobación exige tablas doradas de DST, medianoche, feriados, retroactivos, límites y
reconciliación.
