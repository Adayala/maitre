# Objetivo — SPEC-055

Definir la frontera HTTP de Visit para abrir, consultar y avanzar su lifecycle preservando
Occupancy, Check y aislamiento bajo concurrencia.

## Criterios de aceptación

### CAD-055-01 — La API separa claramente contexto autenticado, scope y datos de cliente

Las rutas y DTO distinguen contexto autenticado, parámetros de scope y datos permitidos al
cliente.

### CAD-055-02 — La apertura de Visit coordina idempotencia y seating inicial atómico

create es idempotente y crea Visit más seating inicial en una única transacción.

### CAD-055-03 — Los comandos del lifecycle exigen precondiciones, permisos y revisión

request-close, close, cancel y reopen correctivo poseen precondiciones, permisos y
revisiones explícitos.

### CAD-055-04 — Las lecturas preservan paginación estable y ocultamiento por scope

list/detail usan filtros acotados, cursor estable y no revelan recursos fuera del
tenant/Branch autorizado.

### CAD-055-05 — Los errores distinguen causa sin filtrar información sensible

Problem Details distingue autenticación, ocultamiento, conflicto, precondición y
transición sin filtrar datos sensibles.

### CAD-055-06 — La aprobación exige evidencia de RBAC, atomicidad y aislamiento

La aprobación exige contratos de RBAC, auditoría, outbox, concurrencia, idempotencia y
aislamiento.
