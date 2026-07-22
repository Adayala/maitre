# Especificación — SPEC-151 InvoiceValidated

Nombre normativo `fiscal.invoice.validated.v1`; `InvoiceGenerated` queda legado no publicable. Se
emite cuando DRAFT pasa a VALIDATED y queda listo para solicitar autorización, no cuando existe un
comprobante fiscal.

Envelope SPEC-217 + fiscalEntity, invoice, voucher type, currency, totals, source Check revision y
aggregate revision. Omite receptor/PII. Un nuevo validation tras cambios usa revisión superior.
