# Verificación — SPEC-134

## Criterios

### CAD-134-01 — Inputs por tenant/sucursal/fecha de negocio/timezone/moneda quedan definidos sin ambigüedad

- [ ] inputs de sucursal/fecha/timezone/moneda/revision quedan congelados correctamente.

### CAD-134-02 — El cálculo es puro y separa cash journal de medios no-cash

- [ ] el cálculo es puro y reconcilia cash vs no-cash por source identities.

### CAD-134-03 — El resultado agrega openings, movements, differences y ajustes tardíos sin netear monedas

- [ ] agregados diarios preservan openings, movements, differences y late adjustments.

### CAD-134-04 — Input hash, cutoffs, revisions y trazabilidad de motivos garantizan reproducibilidad

- [ ] input hash, cutoffs y trazabilidad de motivos garantizan reproducibilidad.

### CAD-134-05 — Recalcular crea nueva versión sin mutar settlements cerrados o exportados

- [ ] recalcular crea nueva versión sin mutar resultados cerrados/exportados.

### CAD-134-06 — La aprobación exige evidencia de DST, múltiples cajas y reconciliación contable

- [ ] fixtures cubren DST, medianoche, múltiples cajas, monedas y cierres tardíos.
