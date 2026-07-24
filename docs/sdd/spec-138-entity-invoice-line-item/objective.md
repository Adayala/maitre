# Objetivo — SPEC-138

Definir InvoiceLineItem como snapshot fiscal inmutable y reconciliable de la operación fuente, con
ecuaciones monetarias exactas y referencia a descuentos/aplicaciones.

## Criterios de aceptación

### CAD-138-01 — Snapshot fiscal por línea y source refs quedan definidos sin ambigüedad

snapshot fiscal por línea, unidades, cantidades y referencias fuente quedan definidos sin
ambigüedad.

### CAD-138-02 — Bases, descuentos, tax y gross siguen ecuaciones exactas y versionadas

bases gravadas/exentas/no gravadas, descuentos, tax y gross siguen ecuaciones exactas y
versionadas.

### CAD-138-03 — La suma de líneas y residuos reconcilia exactamente con Invoice

la suma de líneas, residuos explícitos y totales de Invoice reconcilia exactamente.

### CAD-138-04 — La línea no depende del catálogo futuro y conserva refs fuente

la línea no depende del catálogo luego de emitir y conserva refs a discount/source line.

### CAD-138-05 — Credit/DebitNotes usan semántica documental sin signos ambiguos

Credit/DebitNotes usan semántica documental, no signos ambiguos en quantity/precio.

### CAD-138-06 — La aprobación exige evidencia de alícuotas, rounding e inmutabilidad

La aprobación exige fixtures de cantidades, bonificaciones, múltiples alícuotas, rounding,
inmutabilidad y reconciliación.
