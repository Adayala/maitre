# Objetivo — SPEC-127

Definir Discount como política versionada y DiscountApplication como hecho aplicado sobre Order/Check
con stacking, caps y tax treatment reproducibles.

## Criterios de aceptación

### CAD-127-01 — Discount policy y DiscountApplication conservan autoridades separadas

Discount policy y DiscountApplication quedan separados con autoridad inequívoca.

### CAD-127-02 — Tipo, scope, vigencia, stacking y caps quedan definidos sin ambigüedad

tipo, scope, elegibilidad, vigencia, priority, stacking y caps quedan definidos sin
ambigüedad.

### CAD-127-03 — Orden de aplicación y redondeo usan MoneyPolicy compartida

el orden de aplicación y redondeo usa MoneyPolicy compartida y produce resultados
reproducibles.

### CAD-127-04 — Una aplicación nunca vuelve negativa la base elegible ni reescribe historia

una aplicación nunca vuelve negativa la base elegible ni reescribe historia.

### CAD-127-05 — Overrides y thresholds conservan actor, capability y reason auditados

overrides, thresholds y approval guardan actor/capability/reason auditados.

### CAD-127-06 — La aprobación exige evidencia de overlaps, stacking, caps y rounding

La aprobación exige fixtures de overlaps, timezone, stacking, caps, rounding, desactivación
y aislamiento.
