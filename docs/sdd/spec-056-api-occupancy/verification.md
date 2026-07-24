# Verificación — SPEC-056

## Criterios

### CAD-056-01 — La superficie distingue lecturas históricas de comandos autorizados

- [ ] sólo existen lecturas y los tres comandos aprobados.

### CAD-056-02 — Cada comando deriva actor y scope, y exige idempotencia con revisión

- [ ] reintentos no duplican intervalos y revisiones obsoletas fallan.

### CAD-056-03 — Las operaciones multi-table preservan atomicidad y exclusión activa

- [ ] doble seat y move concurrente no dejan asignación parcial.

### CAD-056-04 — Release parcial conserva historia y revalida capacidad

- [ ] release parcial conserva capacidad e historia inmutable.

### CAD-056-05 — La API oculta datos sensibles y conflictos ajenos

- [ ] Problem Details y lecturas no filtran datos sensibles o fuera de scope.

### CAD-056-06 — La aprobación exige evidencia de rollback, concurrencia y aislamiento

- [ ] cursor, límites, rollback, locks, auditoría y aislamiento son verificables;
- [ ] TableStatus stale nunca autoriza una mutación.
