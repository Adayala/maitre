# Verificación — SPEC-121

Estado actual: assessment inicial de especificación. La spec ya define snapshot de input, trace
model, retroactivos y `NOT_CONFIGURED`; falta materialización y cierre de fixtures.

## Criterios

### CAD-121-01 — Inputs aprobados, policy version y adjustment chain quedan definidos sin ambigüedad

- [ ] inputs aprobados, adjustments y policy version quedan congelados correctamente.

### CAD-121-02 — El cálculo es puro, determinista y decimal con trazabilidad completa

- [ ] el cálculo es puro, decimal y determinista con trazabilidad completa.

### CAD-121-03 — El resultado distingue categorías y provenance de reglas aplicadas

- [ ] categorías y reglas aplicadas se explican sin ambigüedad.

### CAD-121-04 — Nuevas correcciones crean nuevas projections sin reescribir exportados

- [ ] nuevas correcciones crean nuevas projections y preservan exportados.

### CAD-121-05 — `NOT_CONFIGURED` bloquea afirmaciones silenciosas sin policy aplicable

- [ ] falta de policy devuelve `NOT_CONFIGURED` sin estimaciones silenciosas.

### CAD-121-06 — La aprobación exige evidencia de DST, feriados, retroactivos y reconciliación

- [ ] fixtures cubren DST, medianoche, feriados, retroactivos y reconciliación.
