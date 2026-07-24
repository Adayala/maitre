# Objetivo — SPEC-126

Definir CashReconciliation como comparación versionada entre expected y counted sobre una sesión
cerrada, con segregación de duties y evidencia congelada.

## Criterios de aceptación

### CAD-126-01 — Expected, counted, difference y su fórmula quedan definidos sin ambigüedad

expected, counted, difference y su fórmula quedan definidos sin ambigüedad.

### CAD-126-02 — Reconciliation sólo aplica sobre CashSession `CLOSED` con ledger congelado

reconciliation sólo aplica sobre CashSession `CLOSED` y congela la ledger revision
observada.

### CAD-126-03 — Lifecycle, terminalidad y resubmission tras rechazo son inequívocos

lifecycle, terminalidad y resubmission tras rechazo son inequívocos.

### CAD-126-04 — Segregación preparer/approver se respeta cuando la policy lo exige

approver/preparer segregation se respeta cuando la policy lo exige.

### CAD-126-05 — Aprobadas no mutan por eventos tardíos; usan flujos posteriores explícitos

una reconciliation aprobada no muta por eventos tardíos; usa ajustes enlazados o
revisiones nuevas según corresponda.

### CAD-126-06 — La aprobación exige evidencia de reconteo, rechazo y moneda

La aprobación exige fixtures de reconteo, diferencias, moneda, rechazo/reenvío, evidencia
y aislamiento.
