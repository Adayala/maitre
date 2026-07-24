# Verificación — SPEC-127

## Criterios

### CAD-127-01 — Discount policy y DiscountApplication conservan autoridades separadas

- [ ] policy y application mantienen fronteras de autoridad claras.

### CAD-127-02 — Tipo, scope, vigencia, stacking y caps quedan definidos sin ambigüedad

- [ ] tipo, scope, elegibilidad, vigencia, stacking y caps son reproducibles.

### CAD-127-03 — Orden de aplicación y redondeo usan MoneyPolicy compartida

- [ ] orden de aplicación y redondeo siguen MoneyPolicy compartida.

### CAD-127-04 — Una aplicación nunca vuelve negativa la base elegible ni reescribe historia

- [ ] base elegible nunca queda negativa y la historia no se reescribe.

### CAD-127-05 — Overrides y thresholds conservan actor, capability y reason auditados

- [ ] overrides y thresholds conservan actor/reason/approval auditados.

### CAD-127-06 — La aprobación exige evidencia de overlaps, stacking, caps y rounding

- [ ] fixtures cubren overlaps, stacking, rounding, caps y timezone.
