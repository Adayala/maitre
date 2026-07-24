# Especificación — SPEC-152 InvoiceAuthorized

Único hecho de dominio contable: `fiscal.invoice.authorized.v1`, emitido por outbox cuando Invoice
pasa a AUTHORIZED por respuesta directa o reconciliación.

Incluye envelope, fiscalEntity/pointOfSale/invoice IDs, voucher type/number, currency/totals,
authorization code redactado, expiry y aggregate revision; omite PII. Consumidores contabilizan
este evento, no SPEC-153.

La emisión del evento es at-least-once y usa deduplicación por `invoiceId + aggregateRevision +
eventType`. Su publicación debe ocurrir en la misma transacción lógica que la persistencia del estado
`AUTHORIZED`, de modo que nunca exista una invoice autorizada sin capacidad de propagación eventual.

El evento no reemplaza la consulta del comprobante ni expone payloads SOAP/raw del proveedor. Si una
autorización se confirma sólo tras reconciliación, el evento igualmente se publica una sola vez en el
momento en que la invoice cambia a `AUTHORIZED`. No existe variante separada para “autorizada por
reconciliación”.
