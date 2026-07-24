# Objetivo — SPEC-050

## Propósito

Occupancy es la autoridad temporal que vincula una Table con una Visit y conserva cada
intervalo de asignación sin convertir Table en fuente duplicada de ocupación.

## Resultado esperado

### CAD-050-01 — Cada intervalo conserva identidad coherente y semántica temporal estable

Cada intervalo identifica tenant, Branch, Visit y Table coherentes y usa semántica
semiabierta `[startedAt, endedAt)`.

### CAD-050-02 — Una Table mantiene unicidad de Occupancy activa

Una Table admite como máximo una Occupancy ACTIVE.

### CAD-050-03 — La capacidad asignada respeta límites y políticas aplicables

El total asignado es positivo y respeta capacidad y política aplicables.

### CAD-050-04 — Seat y move coordinan cambios atómicos con orden estable de locks

seat y move son atómicos y adquieren locks en orden estable.

### CAD-050-05 — El cierre parcial sólo procede si preserva validez de capacidad

Un cierre parcial sólo procede si la capacidad restante sigue siendo válida.

### CAD-050-06 — La aprobación exige evidencia temporal, concurrente e inmutable suficiente

La aprobación exige evidencia de historia inmutable, reloj controlado, concurrencia,
idempotencia y aislamiento tenant/Branch.
