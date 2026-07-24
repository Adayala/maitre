# Verificación — SPEC-052

## Criterios

### CAD-052-01 — Check mantiene unicidad por Visit y coherencia de scope monetario

- [ ] unicidad por Visit y coherencia de scope/currency.

### CAD-052-02 — Las líneas económicas congelan snapshots de sus fuentes

- [ ] snapshots permanecen estables ante cambios de sus fuentes.

### CAD-052-03 — Los totales se derivan con política monetaria explícita

- [ ] matrices de precisión, descuentos, impuestos, cargos, propinas y refunds.

### CAD-052-04 — El lifecycle de Check es acotado y auditado

- [ ] todas las transiciones válidas e inválidas son deterministas.

### CAD-052-05 — La liquidación comercial no absorbe autoridad fiscal

- [ ] cada blocker de SETTLED/VOID aborta sin efectos parciales y no altera Invoice.

### CAD-052-06 — La aprobación exige evidencia monetaria, concurrente y reconciliable

- [ ] conflictos de revisión, reintentos, ajustes y aislamiento generan evidencia
      reconciliable.
