# Verificación — SPEC-130

## Criterios

### CAD-130-01 — La API de reconciliación define expected summary, counts y comandos con claridad

- [ ] expected summary, count entry y submit/approve/reject tienen surface estable.

### CAD-130-02 — Expected se recalcula server-side y nunca se acepta del cliente

- [ ] expected se recalcula server-side y jamás se toma del cliente.

### CAD-130-03 — Late payments/refunds posteriores a cutoff no mutan aprobadas

- [ ] pagos/refunds tardíos no mutan reconciliaciones aprobadas.

### CAD-130-04 — Reopen es default-deny salvo policies explícitas

- [ ] reopen sigue default-deny y sólo policies explícitas crean nuevas revisiones.

### CAD-130-05 — Segregación, motivos y evidencia quedan auditados en cada transición

- [ ] segregación, motivos y evidencia quedan auditados en cada transición.

### CAD-130-06 — La aprobación exige evidencia de pagos tardíos, reopen y precisión decimal

- [ ] fixtures cubren pagos tardíos, reconteos, reopen controlado y precisión decimal.
