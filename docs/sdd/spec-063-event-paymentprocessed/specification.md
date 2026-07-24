# Especificación — SPEC-063 Payment Terminal Events

No se publica `PaymentProcessed` ambiguo. Contratos:

- `payments.payment.authorized.v1`;
- `payments.capture.succeeded.v1`;
- `payments.payment.failed.v1`;
- `payments.payment.voided.v1`;
- `payments.refund.succeeded.v1`;
- `payments.refund.failed.v1`.

Payment es aggregate/partition para authorized, failed y voided; Capture usa `paymentId` como
partition e incluye `captureId`; Refund usa `paymentId` como partition e incluye `refundId`
y `captureId`. Cada evento representa una transición exacta con envelope SPEC-217,
tenant/Branch, Payment/Check/Visit, operation identity, amount/currency cuando aplica, method
category, outcome code normalizado, occurredAt y revisiones.

Una captura parcial emite un hecho por Capture, no un “Payment capturado” ambiguo. Timeout o
`PENDING_RECONCILIATION` no emite succeeded/failed hasta resolución autoritativa. Se omiten
instrumentos, secretos, PII, textos del provider y referencias completas. Consumidores
deduplican por eventId y operation identity y convergen por aggregate revision.
