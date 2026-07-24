# Objetivo — SPEC-056

Definir lectura y comandos sobre Occupancy sin aceptar intervalos del cliente ni confiar en
TableStatus como autoridad.

## Criterios de aceptación

### CAD-056-01 — La superficie distingue lecturas históricas de comandos autorizados

La superficie separa historial read-only de seat, move y release.

### CAD-056-02 — Cada comando deriva actor y scope, y exige idempotencia con revisión

Cada comando deriva scope/actor, exige idempotencia y valida revisiones explícitas.

### CAD-056-03 — Las operaciones multi-table preservan atomicidad y exclusión activa

Operaciones multi-table son atómicas, bloquean en orden estable y preservan exclusión
ACTIVE.

### CAD-056-04 — Release parcial conserva historia y revalida capacidad

release parcial revalida capacidad y nunca reescribe intervalos cerrados.

### CAD-056-05 — La API oculta datos sensibles y conflictos ajenos

Respuestas y errores no revelan Visit, Guest ni Occupancy conflictiva.

### CAD-056-06 — La aprobación exige evidencia de rollback, concurrencia y aislamiento

La aprobación exige fixtures de rollback, retry, concurrencia, paginación, auditoría y
aislamiento.
