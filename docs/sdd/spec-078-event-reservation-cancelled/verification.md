# Verificación — SPEC-078

## Criterios

### CAD-078-01 — ReservationCancelled representa sólo una cancelación ya consumada

- [ ] transiciones distintas no emiten ReservationCancelled.

### CAD-078-02 — Cancelación, release y outbox comparten atomicidad e idempotencia

- [ ] rollback/duplicate no dejan release/event duplicados.

### CAD-078-03 — El payload expone scope, reason y revisión sin texto libre ni PII

- [ ] schema, catálogos y scanners prueban payload mínimo.

### CAD-078-04 — Los consumers no ejecutan side effects de capacidad ni cobro

- [ ] consumers no liberan ni cobran y notification permanece separada.

### CAD-078-05 — Reorder, duplicate y gaps convergen por eventId y revisión

- [ ] confirm/cancel reorder, gap y replay convergen por ID/revision.

### CAD-078-06 — La aprobación exige evidencia de rollback, replay y compatibilidad

- [ ] compatibility, DLQ, redacción y routing poseen evidencia.
