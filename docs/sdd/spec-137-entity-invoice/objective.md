# Objetivo — SPEC-137

Definir Invoice como agregado fiscal autoritativo e inmutable tras autorización, con identidad
fiscal única y corrección exclusiva mediante notas referenciadas.

## Criterios de aceptación

### CAD-137-01 — Lifecycle, terminalidad y `PENDING_RECONCILIATION` quedan definidos sin ambigüedad

lifecycle, terminalidad y semántica de `PENDING_RECONCILIATION` quedan definidos sin
ambigüedad.

### CAD-137-02 — La identidad fiscal única queda congelada y no colisiona

la identidad fiscal única `environment + fiscalEntity + POS + voucherType + number` queda
congelada y no colisiona.

### CAD-137-03 — AUTHORIZED congela el snapshot fiscal completo

AUTHORIZED congela receptor, líneas, totales, currency, CAE/expiry, normative versions y
source revision completas.

### CAD-137-04 — Una invoice autorizada nunca se cancela ni edita in-place

una invoice autorizada nunca se cancela ni edita; correcciones usan Credit/Debit Notes
referenciadas.

### CAD-137-05 — Tenant isolation, PII y datos fiscales aplican en drafts y retries

tenant isolation, PII y datos fiscales aplican incluso a drafts y retries de autorización.

### CAD-137-06 — La aprobación exige evidencia de unicidad, precisión e aislamiento

La aprobación exige fixtures de unicidad fiscal, idempotencia, precisión decimal,
transiciones, snapshots, PII y aislamiento.
