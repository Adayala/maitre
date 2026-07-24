# Objetivo — SPEC-076

Publicar el hecho de creación de una Reservation sin implicar confirmación ni revelar PII.

## Criterios de aceptación

### CAD-076-01 — ReservationCreated fija nombre, aggregate y partition autorizados

El único nombre publicable es `reservations.reservation.created.v1` con
aggregate/partition Reservation.

### CAD-076-02 — El evento se publica sólo con creación y hold confirmados atómicamente

Se produce sólo al confirmar atómicamente Reservation PENDING, CapacityHold HELD y outbox.

### CAD-076-03 — Envelope y payload conservan calendario, scope y revisión inequívocos

envelope/payload contienen scope, calendario, partySize, source, Hold expirable y
aggregateRevision inequívocos.

### CAD-076-04 — El payload excluye PII y cualquier semántica de confirmación

se omiten Guest, contacto, notas, preferencias sensibles, capability y cualquier
significado de confirmación.

### CAD-076-05 — Dedupe, reorder y gap convergen sin usar el evento como autoridad

eventId, revisión, dedupe, reorder y gap/refetch permiten convergencia sin usar el evento
como autorización.

### CAD-076-06 — La aprobación exige evidencia de rollback, compatibilidad y routing aislado

La aprobación exige fixtures de rollback, retry, DLQ, DST, compatibilidad, redacción y
routing aislado.
