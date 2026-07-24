# Verificación — SPEC-076

## Criterios

### CAD-076-01 — ReservationCreated fija nombre, aggregate y partition autorizados

- [ ] registry rechaza nombres/versiones no aprobados.

### CAD-076-02 — El evento se publica sólo con creación y hold confirmados atómicamente

- [ ] rollback no deja Reservation/Hold/event parciales.

### CAD-076-03 — Envelope y payload conservan calendario, scope y revisión inequívocos

- [ ] schema temporal/Hold/revisión es inequívoco.

### CAD-076-04 — El payload excluye PII y cualquier semántica de confirmación

- [ ] scanners prueban redacción y ausencia de semántica Confirmed.

### CAD-076-05 — Dedupe, reorder y gap convergen sin usar el evento como autoridad

- [ ] duplicate/reorder/gap/replay convergen sin mutar autoridad.

### CAD-076-06 — La aprobación exige evidencia de rollback, compatibilidad y routing aislado

- [ ] compatibility, DLQ y routing tenant/Branch poseen evidencia.
