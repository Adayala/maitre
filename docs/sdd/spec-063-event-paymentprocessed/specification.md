# Especificación — SPEC-063 Payment Terminal Events

No se publica `PaymentProcessed` ambiguo. Contratos: `payment.authorized.v1`, `captured.v1`,
`failed.v1`, `voided.v1`, `refund.succeeded.v1` y `refund.failed.v1`.

Cada evento representa transición terminal/lógica exacta, con envelope, payment/refund/check IDs,
amount/currency, method category, provider outcome code normalizado y revisions; omite instruments,
secrets y PII. Consumidores deduplican por event ID/provider operation.
