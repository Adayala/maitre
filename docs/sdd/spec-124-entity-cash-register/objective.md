# Objetivo — SPEC-124

Definir CashRegister como configuración de caja y CashSession como agregado autoritativo de apertura,
cierre y ledger por register/currency.

## Criterios de aceptación

### CAD-124-01 — CashRegister y CashSession mantienen fronteras de autoridad inequívocas

CashRegister y CashSession quedan separados con scope, identidad y autoridad inequívocos.

### CAD-124-02 — El lifecycle y la unicidad de CashSession son reproducibles

lifecycle de CashSession, terminalidad y unicidad por register/currency son reproducibles.

### CAD-124-03 — Opening, cutoff y ledger revision quedan congelados con money exacto

opening, cutoff, cierre y ledger revision quedan congelados con money exacto y timezone de
negocio.

### CAD-124-04 — Suspensión y late adjustments no reabren sesiones cerradas

suspensión operativa, late adjustments y eventos tardíos no reabren ni reescriben sesiones
cerradas.

### CAD-124-05 — CashRegister no absorbe saldo ni movimientos; CashSession sí gobierna ledger

CashRegister no absorbe saldo corriente ni movimientos; CashSession sí conserva la
autoridad contable operativa de la sesión.

### CAD-124-06 — La aprobación exige evidencia de doble apertura, multicurrency y ajustes tardíos

La aprobación exige fixtures de doble apertura, suspensión, concurrencia, multicurrency,
late adjustment y aislamiento.
