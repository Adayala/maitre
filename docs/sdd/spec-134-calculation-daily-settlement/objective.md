# Objetivo — SPEC-134

Definir un cálculo puro y reproducible de settlement diario por sucursal, fecha de negocio y moneda
sobre ledger y reconciliaciones versionadas.

## Criterios de aceptación

### CAD-134-01 — Inputs por tenant/sucursal/fecha de negocio/timezone/moneda quedan definidos sin ambigüedad

inputs por tenant/sucursal/fecha de negocio/timezone/moneda/ledger revision quedan definidos
sin ambigüedad.

### CAD-134-02 — El cálculo es puro y separa cash journal de medios no-cash

el cálculo es puro, determinista y separa cash journal de medios no-cash con source
identity reconciliation.

### CAD-134-03 — El resultado agrega openings, movements, differences y ajustes tardíos sin netear monedas

el resultado agrega openings, movements, expected, counted, differences y late adjustments
sin netear monedas.

### CAD-134-04 — Input hash, cutoffs, revisions y trazabilidad de motivos garantizan reproducibilidad

input hash, cutoffs, revisions y trazabilidad de motivos permiten reproducibilidad completa.

### CAD-134-05 — Recalcular crea nueva versión sin mutar settlements cerrados o exportados

recalcular crea nueva versión y no muta un settlement cerrado o exportado.

### CAD-134-06 — La aprobación exige evidencia de DST, múltiples cajas y reconciliación contable

La aprobación exige fixtures de medianoche, DST, múltiples cajas, cierres tardíos,
compensaciones, monedas y reconciliación contable.
