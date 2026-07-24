# Verificación — SPEC-050

## Criterios

### CAD-050-01 — Cada intervalo conserva identidad coherente y semántica temporal estable

- [ ] intervalos y referencias inválidas se rechazan sin efectos.

### CAD-050-02 — Una Table mantiene unicidad de Occupancy activa

- [ ] dos seat concurrentes sobre la misma Table producen un único ACTIVE.

### CAD-050-03 — La capacidad asignada respeta límites y políticas aplicables

- [ ] bordes de capacidad y asignaciones inválidas tienen resultados estables.

### CAD-050-04 — Seat y move coordinan cambios atómicos con orden estable de locks

- [ ] move multi-table es atómico, idempotente y libre de deadlock.

### CAD-050-05 — El cierre parcial sólo procede si preserva validez de capacidad

- [ ] cierre parcial preserva capacidad o falla sin cerrar intervalos.

### CAD-050-06 — La aprobación exige evidencia temporal, concurrente e inmutable suficiente

- [ ] CLOSED no se reabre;
- [ ] reloj, historia, revisión y aislamiento quedan cubiertos por fixtures deterministas.
