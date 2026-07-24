# Objetivo — SPEC-049

## Propósito

Visit representa una sesión operativa de atención en una sucursal, desde que el grupo ocupa
capacidad hasta que su servicio queda cerrado o se cancela antes de consumir.

## Resultado esperado

### CAD-049-01 — Visit mantiene identidad operativa y contexto de atención coherentes

Toda Visit identifica tenant, sucursal, cantidad de comensales y, cuando corresponda, una
Reservation compatible.

### CAD-049-02 — El ciclo autoritativo de Visit queda acotado y sin ambigüedades

El ciclo autoritativo es `OPEN → CLOSING → CLOSED`; `CANCELLED` sólo termina una Visit
sin consumo ni Check.

### CAD-049-03 — Los estados derivados no se persisten como autoridad independiente

`SEATED`, `IN_SERVICE` y `PAYING` son estados derivados y no admiten escrituras
independientes.

### CAD-049-04 — La asignación de mesas se delega en Occupancy y evita solapamientos inválidos

Las mesas se asignan mediante Occupancy y ninguna operación permite ocupaciones activas
incompatibles.

### CAD-049-05 — El cierre valida dependencias operativas y publica efectos de forma atómica

El cierre valida Check, saldo, pagos pendientes, cocina y Occupancies, y publica su
outbox atómicamente.

### CAD-049-06 — La aprobación exige evidencia operativa, concurrente y auditable suficiente

La aprobación exige evidencia de transiciones, idempotencia, concurrencia, capacidad,
corrección auditada y aislamiento tenant/sucursal.
