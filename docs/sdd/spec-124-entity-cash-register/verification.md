# Verificación — SPEC-124

## Criterios

### CAD-124-01 — CashRegister y CashSession mantienen fronteras de autoridad inequívocas

- [ ] CashRegister y CashSession conservan fronteras de autoridad claras.

### CAD-124-02 — El lifecycle y la unicidad de CashSession son reproducibles

- [ ] lifecycle y unicidad por register/currency bloquean dobles aperturas.

### CAD-124-03 — Opening, cutoff y ledger revision quedan congelados con money exacto

- [ ] business date/timezone y money exacto quedan congelados consistentemente.

### CAD-124-04 — Suspensión y late adjustments no reabren sesiones cerradas

- [ ] late adjustments y suspensión no reescriben sesiones cerradas.

### CAD-124-05 — CashRegister no absorbe saldo ni movimientos; CashSession sí gobierna ledger

- [ ] register no absorbe movimientos ni saldo corriente; session sí gobierna ledger.

### CAD-124-06 — La aprobación exige evidencia de doble apertura, multicurrency y ajustes tardíos

- [ ] fixtures cubren concurrencia, multicurrency, suspensión y ajustes tardíos.
