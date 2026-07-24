# Verificación — SPEC-063

## Criterios

### CAD-063-01 — El registry admite sólo los nombres de eventos aprobados

- [ ] registry rechaza PaymentProcessed y nombres no aprobados.

### CAD-063-02 — Cada evento fija trigger, aggregate e identidad operativa inequívocos

- [ ] cada transición/operación emite exactamente su schema e identidad.

### CAD-063-03 — Los importes y referencias se exponen sólo cuando son necesarios

- [ ] capturas y Refund parciales reproducen MoneyPolicy y redacción.

### CAD-063-04 — La conciliación ambigua no publica éxitos espurios

- [ ] timeout ambiguo no emite resultado y retry/receipt no duplica hechos.

### CAD-063-05 — Los consumidores no retroceden terminales ni infieren datos prohibidos

- [ ] eventos tardíos no retroceden ni duplican Cash/Check/Invoice effects.

### CAD-063-06 — La aprobación exige evidencia de parciales, privacidad y compatibilidad

- [ ] envelope, replay, compatibilidad, privacidad y routing poseen evidencia.
