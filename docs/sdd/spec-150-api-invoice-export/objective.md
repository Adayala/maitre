# Objetivo — SPEC-150

Definir la API asíncrona para exportación de invoices y libros fiscales, con manifest auditable y
distinción explícita entre generar archivos y presentar información ante la autoridad.

## Criterios de aceptación

### CAD-150-01 — La exportación se modela como job asíncrono con scope explícito

la exportación se modela como job asíncrono por period, fiscal entity, point of sale y
format version.

### CAD-150-02 — Sólo comprobantes `AUTHORIZED` integran el dataset exportable

sólo incluye invoices y notas `AUTHORIZED`; estados `PENDING_RECONCILIATION` o `REJECTED`
aparecen en reportes de excepción, no como ventas válidas.

### CAD-150-03 — Cada export conserva manifest con revisiones, hashes y errores

cada export conserva manifest con counts, totals, currency/tax breakdown, input revision,
layout normative version, hashes y errores.

### CAD-150-04 — Descargas expiran, se auditan y no equivalen a presentación oficial

downloads firmados o temporales expiran, se auditan y nunca equivalen a una confirmación
de presentación ante ARCA.

### CAD-150-05 — La reconciliación exige diferencia cero salvo residuos aprobados

la reconciliación exige suma determinística de invoices/notas contra libro dentro de
diferencia cero, salvo residuos explícitos de redondeo aprobados.

### CAD-150-06 — La aprobación exige evidencia de períodos, expiración y manifest determinístico

La aprobación exige fixtures de periodos, diferencias, expiración de descarga, manifest
determinístico y excepción de comprobantes no exportables.
