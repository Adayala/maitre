# Verificación — SPEC-126

## Criterios

### CAD-126-01 — Expected, counted, difference y su fórmula quedan definidos sin ambigüedad

- [ ] expected/counted/difference siguen fórmula y money exacto aprobados.

### CAD-126-02 — Reconciliation sólo aplica sobre CashSession `CLOSED` con ledger congelado

- [ ] sólo sesiones `CLOSED` con revisión de ledger congelada pueden reconciliarse.

### CAD-126-03 — Ciclo de vida, terminalidad y resubmission tras rechazo son inequívocos

- [ ] ciclo de vida y resubmission tras rechazo conservan historial íntegro.

### CAD-126-04 — Segregación preparer/approver se respeta cuando la policy lo exige

- [ ] segregación preparer/approver se valida cuando aplica.

### CAD-126-05 — Aprobadas no mutan por eventos tardíos; usan flujos posteriores explícitos

- [ ] aprobadas no mutan por eventos tardíos; usan flujos posteriores explícitos.

### CAD-126-06 — La aprobación exige evidencia de reconteo, rechazo y moneda

- [ ] fixtures cubren reconteo, diferencias, rechazo/reenvío y aislamiento entre tenants.
