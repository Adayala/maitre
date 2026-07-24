# Verificación — SPEC-129

## Criterios

### CAD-129-01 — La API de CashMovements define create/list y `compensate` con alcance claro

- [ ] create/list/compensate tienen superficie y alcance inequívocos.

### CAD-129-02 — Create exige sesión válida, amount positivo y referencias obligatorias

- [ ] sesión, currency, type, idempotencia y referencias se validan correctamente.

### CAD-129-03 — Operaciones riesgosas dependen de LimitsPolicy explícita

- [ ] LimitsPolicy gobierna operaciones riesgosas y falla cerrado si falta.

### CAD-129-04 — No existen update/delete; compensation crea movimiento inverso auditado

- [ ] no hay update/delete; compensation es append-only y auditada.

### CAD-129-05 — Integraciones de Payment no duplican impacto económico

- [ ] integraciones de Payment no duplican impacto económico por source identity.

### CAD-129-06 — La aprobación exige evidencia de sesión cerrada, límites y compensación

- [ ] fixtures cubren sesión cerrada, límites, duplicados y paginación estable.
