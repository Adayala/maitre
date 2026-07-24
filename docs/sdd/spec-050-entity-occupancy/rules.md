# Rules — SPEC-050

- Visit y Table pertenecen al mismo tenant y Branch que Occupancy.
- `allocatedGuests > 0` y la suma aplicable no excede la capacidad aprobada.
- Sólo existe una Occupancy ACTIVE por Table; no basta una validación previa en memoria.
- Seat, move y close usan control de revisión e idempotencia.
- Move cierra el intervalo anterior y crea el nuevo en una operación atómica; nunca
  reescribe `startedAt`.
- Los recursos involucrados se bloquean por identificador estable para evitar deadlocks.
- CLOSED es terminal. Toda corrección crea evidencia adicional, no modifica historia.
