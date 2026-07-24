# Especificación — SPEC-137 Invoice

Lifecycle: `DRAFT -> VALIDATED -> AUTHORIZATION_PENDING -> AUTHORIZED | REJECTED`; timeout ambiguo
produce `PENDING_RECONCILIATION`. Sólo DRAFT/VALIDATED pueden abandonarse como `VOIDED_DRAFT`.
Una AUTHORIZED nunca se cancela ni edita: correcciones son Credit/DebitNote autorizadas y
referenciadas al comprobante original.

Identity fiscal única: environment + fiscalEntity + FiscalPointOfSale + voucherType + number.
AUTHORIZED congela receptor, líneas, totales, currency, CAE/expiry, normative versions y source
Check revision. Tenant isolation y PII aplican incluso a drafts.

Invoice pertenece a una `fiscalEntityId` dentro de un tenant y conserva `invoiceId`, `environment`,
`pointOfSaleId`, `voucherType`, `number?`, `status`, `recipientSnapshot`, `currency`, `totals`,
`sourceCheckRevision`, `authorizationProviderRef?`, `cae?`, `caeExpiresAt?`, `normativeVersion` y
metadata de auditoría. `number` puede reservarse o asignarse según el flujo autorizado, pero una vez
autorizado queda inmutable junto con la identidad fiscal completa.

`DRAFT` y `VALIDATED` permiten abandono como `VOIDED_DRAFT` antes de autorización. `AUTHORIZED` es
terminal desde el punto de vista del comprobante: si existe error o corrección, se emite una nota
de crédito o débito referenciada al comprobante original. `REJECTED` conserva evidencia del intento
fallido. `PENDING_RECONCILIATION` modela timeout ambiguo o respuesta incierta del autorizador y no
debe confundirse con rechazo definitivo.
