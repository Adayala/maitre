# Objetivo — SPEC-078

Publicar una cancelación ya consumada y su revisión, manteniendo PII fuera del evento.

## Criterios de aceptación

### CAD-078-01 — ReservationCancelled representa sólo una cancelación ya consumada

`reservations.reservation.cancelled.v1` sólo representa CANCELLED consumado.

### CAD-078-02 — Cancelación, release y outbox comparten atomicidad e idempotencia

cancel, release de Hold/Allocation y outbox son atómicos e idempotentes.

### CAD-078-03 — El payload expone scope, reason y revisión sin texto libre ni PII

payload contiene scope, Reservation, timestamp, reason/actorType, capacidad liberada
opcional y revisión, sin texto libre.

### CAD-078-04 — Los consumers no ejecutan side effects de capacidad ni cobro

consumers no liberan capacidad ni cobran; notification y consecuencias I0 permanecen
separadas.

### CAD-078-05 — Reorder, duplicate y gaps convergen por eventId y revisión

eventId/revisión resuelven duplicate, confirm/cancel reorder y gaps.

### CAD-078-06 — La aprobación exige evidencia de rollback, replay y compatibilidad

La aprobación exige fixtures de rollback, retry, replay, compatibilidad, redacción y
aislamiento.
