# Verificación — SPEC-152

## Criterios

### CAD-152-01 — El evento canónico es `fiscal.invoice.authorized.v1`

- [ ] `fiscal.invoice.authorized.v1` es el único hecho contable autoritativo.

### CAD-152-02 — Se emite por outbox cuando Invoice pasa a `AUTHORIZED`

- [ ] el evento se publica sólo al pasar a `AUTHORIZED`.

### CAD-152-03 — El payload incluye IDs, numeración, totales y expiry con envelope común

- [ ] payload incluye refs, numeración, totales y expiry con envelope común.

### CAD-152-04 — El evento omite PII y datos sensibles no requeridos por consumidores contables

- [ ] PII y datos sensibles quedan fuera del payload.

### CAD-152-05 — Consumidores contables dependen de este evento y no de eventos técnicos

- [ ] consumidores contables dependen de SPEC-152 y no de eventos técnicos.

### CAD-152-06 — La aprobación exige evidencia de reconciliación, deduplicación y ordering

- [ ] fixtures cubren autorización directa, reconciliación, deduplicación y ordering.
