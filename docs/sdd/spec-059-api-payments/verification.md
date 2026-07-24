# Verificación — SPEC-059

## Criterios

### CAD-059-01 — La API define con precisión rutas, schemas y permisos de Payment/Refund

- [ ] OpenAPI contiene sólo lecturas/comandos aprobados y schemas acotados.

### CAD-059-02 — Cada operación conserva identidad idempotente extremo a extremo

- [ ] create/capture/callback duplicados convergen sin cobrar dos veces.

### CAD-059-03 — Los importes se validan contra Check y evitan sobrepago

- [ ] capturas/refunds parciales conservan saldo exacto y rechazan exceso.

### CAD-059-04 — Los callbacks validan autenticidad antes de transicionar

- [ ] firma, replay, provider incorrecto y eventos tardíos/desordenados tienen resultados
      no enumerables y no retroceden estados.

### CAD-059-05 — La conciliación ambigua y el método CASH preservan seguridad operativa

- [ ] timeout exige reconcile, CASH crea un CashMovement y redacción detecta cualquier
      PAN/CVV/secreto/referencia completa.

### CAD-059-06 — La aprobación exige evidencia de retry, redacción y aislamiento

- [ ] revisiones, RBAC, auditoría, atomicidad, outbox y aislamiento fallan cerrado.
