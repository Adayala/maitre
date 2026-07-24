# Rules — SPEC-049

## Invariantes

### 1. Transiciones

`OPEN → CLOSING → CLOSED`. `OPEN → CANCELLED` sólo es válido sin consumo ni Check.
Los estados terminales no se reabren mediante una edición ordinaria.

### 2. Tables assigned
Una Visit operativa debe poseer al menos una Occupancy ACTIVE hasta iniciar su cierre. Los
cambios de mesa son comandos atómicos y auditados sobre Occupancy.

### 3. Guest count
Es positivo y no supera la capacidad asignada según la CapacityPolicyVersion aplicable. Una
Reservation vinculada debe pertenecer al mismo tenant y Branch; toda diferencia permitida
queda explícitamente justificada.

### 4. Estados derivados

La UI deriva seating, servicio y pago de Occupancy, Order/Kitchen y Check. Visit no acepta
escrituras destinadas a forzar esas proyecciones.

### 5. Cierre y corrección

`request-close` impide nuevas órdenes salvo override autorizado. `close` falla de forma
cerrada ante saldo, pagos pendientes, trabajo de cocina u Occupancies incompatibles. Una
corrección posterior es un workflow manager auditado, no una reapertura silenciosa.
