# Especificación — SPEC-137 Invoice

Lifecycle: `DRAFT -> VALIDATED -> AUTHORIZATION_PENDING -> AUTHORIZED | REJECTED`; timeout ambiguo
produce `PENDING_RECONCILIATION`. Sólo DRAFT/VALIDATED pueden abandonarse como `VOIDED_DRAFT`.
Una AUTHORIZED nunca se cancela ni edita: correcciones son Credit/DebitNote autorizadas y
referenciadas al comprobante original.

Identity fiscal única: environment + fiscalEntity + FiscalPointOfSale + voucherType + number.
AUTHORIZED congela receptor, líneas, totales, currency, CAE/expiry, normative versions y source
Check revision. Tenant isolation y PII aplican incluso a drafts.
