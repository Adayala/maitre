# Verificación — SPEC-061

## Criterios

### CAD-061-01 — El nombre del evento y su aggregate quedan fijados sin variantes

- [ ] registry rechaza nombres/versiones distintos.

### CAD-061-02 — El evento se emite sólo tras confirmar apertura y seating iniciales

- [ ] rollback no deja evento y commit deja exactamente un hecho lógico.

### CAD-061-03 — Envelope y payload preservan identidad, causalidad y alcance

- [ ] envelope, payload, conjuntos, timestamps y revisión validan contra schema.

### CAD-061-04 — El payload excluye PII y snapshots comerciales ajenos

- [ ] scanners prueban ausencia de PII y snapshots excluidos.

### CAD-061-05 — El delivery define deduplicación, orden y recuperación de gaps

- [ ] duplicate, reorder y gap convergen por eventId/revision/refetch.

### CAD-061-06 — La aprobación exige evidencia de atomicidad, compatibilidad y routing aislado

- [ ] compatibilidad, DLQ/replay y routing tenant/sucursal poseen evidencia.
