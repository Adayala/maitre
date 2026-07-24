# Verificación — SPEC-099

## Criterios

### CAD-099-01 — Station define identidad, scope y code único por Branch

- [ ] scope, code único y capabilities quedan acotados por Branch.

### CAD-099-02 — El routing de Station se resuelve de forma determinística

- [ ] priority/specificity resuelven routing determinístico y bloquean empates.

### CAD-099-03 — Cada Command congela station, routing revision y reason

- [ ] Commands congelan station, revision y reason sin reescritura histórica.

### CAD-099-04 — Inactivar o archivar una Station exige cero trabajo activo o transferencia

- [ ] inactivación/archivo falla o transfiere atómicamente si hay trabajo activo.

### CAD-099-05 — Station no absorbe autoridad de cola ni observabilidad derivada

- [ ] Station no absorbe cola mutable ni telemetría derivada.

### CAD-099-06 — La aprobación exige evidencia de routing, reroute e inactivación

- [ ] fixtures cubren overlaps, reroute, inactivación y cross-branch.
