# Verificación — SPEC-100

## Criterios

### CAD-100-01 — ProductionQueue es un read model reconstruible, no autoridad mutativa

- [ ] la cola se comporta como proyección read-only reconstruible.

### CAD-100-02 — Orden, desempates y freshness metadata son inequívocos

- [ ] orden, desempates y freshness son estables y reproducibles.

### CAD-100-03 — Reprioritization ocurre sólo por comando auditado

- [ ] reprioritization sólo ocurre por comando auditado.

### CAD-100-04 — Aging y límites de boost previenen starvation sostenida

- [ ] aging/boost limits evitan starvation sostenida bajo policy aprobada.

### CAD-100-05 — Duplicados, reorder y rebuild convergen al mismo orden

- [ ] replay, reorder y rebuild convergen al mismo orden observable.

### CAD-100-06 — La aprobación exige evidencia de ties, reprioritization y aging

- [ ] fixtures cubren ties, stale views, aging y cancelaciones.
