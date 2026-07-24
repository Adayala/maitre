# Verificación — SPEC-077

## Criterios

### CAD-077-01 — ReservationConfirmed fija nombre, aggregate y partition autorizados

- [ ] registry rechaza nombres/versiones no aprobados.

### CAD-077-02 — El evento se emite sólo tras confirmación y allocation en un commit

- [ ] race emite sólo para ganador y rollback no deja parciales.

### CAD-077-03 — El payload expone calendario, unidades y revisiones necesarias

- [ ] calendario/Allocation/units/revisiones validan contra schema.

### CAD-077-04 — El evento omite PII y no concede autoridad sobre capacidad

- [ ] scanners prueban PII ausente y cero mutación por consumers.

### CAD-077-05 — Retry, reconfirmación y gaps convergen por revisión

- [ ] duplicate/reconfirm/reorder/gap convergen por ID/revision.

### CAD-077-06 — La aprobación exige evidencia de carreras, compatibilidad y aislamiento

- [ ] DST, replay, compatibility y routing poseen evidencia.
