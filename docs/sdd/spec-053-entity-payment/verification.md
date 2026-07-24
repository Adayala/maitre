# Verificación — SPEC-053

## Criterios

### CAD-053-01 — Payment conserva identidad de cobro y contexto reconciliable completos

- [ ] scope, revisión, moneda, monto, tip y método inválidos se rechazan.

### CAD-053-02 — El lifecycle de cobro distingue estados operativos sin regresiones arbitrarias

- [ ] matriz de transiciones incluye timeout y resolución de conciliación.

### CAD-053-03 — Los límites monetarios de captura y refund quedan explícitos

- [ ] capturas y Refund parciales respetan todos los límites monetarios.

### CAD-053-04 — La integración con proveedor converge por identidad y revisión

- [ ] retries y callbacks duplicados/stale/desordenados no duplican efectos.

### CAD-053-05 — Los métodos de pago no retienen secretos y coordinan efectos colaterales exactos

- [ ] CASH produce un CashMovement y la evidencia no contiene secretos.

### CAD-053-06 — La aprobación exige evidencia de conciliación, redacción y aislamiento

- [ ] fallos parciales, redacción, revisión y aislamiento son deterministas y
      reconciliables.
