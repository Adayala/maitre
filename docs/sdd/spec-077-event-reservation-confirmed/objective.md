# Objetivo — SPEC-077

Publicar el hecho de confirmación después del consumo transaccional de capacidad.

## Criterios de aceptación

### CAD-077-01 — ReservationConfirmed fija nombre, aggregate y partition autorizados

El único nombre es `reservations.reservation.confirmed.v1` con aggregate/partition
Reservation.

### CAD-077-02 — El evento se emite sólo tras confirmación y allocation en un commit

Sólo se produce al confirmar Allocation, Reservation y outbox en un commit.

### CAD-077-03 — El payload expone calendario, unidades y revisiones necesarias

payload contiene scope, calendario, partySize, Allocation/unidades opcionales, timestamp y
revisiones.

### CAD-077-04 — El evento omite PII y no concede autoridad sobre capacidad

omite Guest/contacto y no concede autoridad sobre capacidad.

### CAD-077-05 — Retry, reconfirmación y gaps convergen por revisión

retry, reconfirmación, reorder y gaps convergen por eventId/revisión.

### CAD-077-06 — La aprobación exige evidencia de carreras, compatibilidad y aislamiento

La aprobación exige fixtures de carreras, rollback, DST, compatibilidad, redacción y
aislamiento.
