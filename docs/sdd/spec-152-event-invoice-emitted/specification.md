# Especificación — SPEC-152 InvoiceAuthorized

Único hecho de dominio contable: `fiscal.invoice.authorized.v1`, emitido por outbox cuando Invoice
pasa a AUTHORIZED por respuesta directa o reconciliación.

Incluye envelope, fiscalEntity/pointOfSale/invoice IDs, voucher type/number, currency/totals,
authorization code redactado, expiry y aggregate revision; omite PII. Consumidores contabilizan
este evento, no SPEC-153.
