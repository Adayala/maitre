# Objetivo — SPEC-152

Definir el único evento contable autoritativo de emisión fiscal para consumidores downstream cuando
una invoice queda efectivamente autorizada.

## Criterios de aceptación

### CAD-152-01 — El evento canónico es `fiscal.invoice.authorized.v1`

el evento canónico es `fiscal.invoice.authorized.v1` y representa el único hecho de
dominio contable posterior a autorización fiscal.

### CAD-152-02 — Se emite por outbox cuando Invoice pasa a `AUTHORIZED`

se emite por outbox cuando Invoice pasa a `AUTHORIZED`, ya sea por respuesta directa o por
reconciliación posterior.

### CAD-152-03 — El payload incluye IDs, numeración, totales y expiry con envelope común

el payload incluye envelope común, fiscalEntity/pointOfSale/invoice IDs, voucher
type/number, currency/totals, authorization code redactado, expiry y aggregate revision.

### CAD-152-04 — El evento omite PII y datos sensibles no requeridos por consumidores contables

el evento omite PII y datos sensibles no requeridos por consumidores contables.

### CAD-152-05 — Consumidores contables dependen de este evento y no de eventos técnicos

consumidores contables y de libro mayor usan este evento, no eventos técnicos como
SPEC-153, evitando doble contabilización.

### CAD-152-06 — La aprobación exige evidencia de reconciliación, deduplicación y ordering

La aprobación exige fixtures de autorización directa, reconciliación, deduplicación,
redaction, ordering y compatibilidad downstream.
