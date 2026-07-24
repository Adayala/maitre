# Especificación — SPEC-182 Payment Provider Connector

Port intent/capture/refund/cancel/query/reconcile con provider idempotency y Payment authority matrix.
Provider es autoridad de resultado externo; Maitre de amount/currency/order intent. Timeout ambiguo se
consulta antes de retry. Webhook firmado actualiza una sola transición por external operation ID.

PAN/CVV nunca atraviesa Maitre. Cada provider requiere spike PASS de API/sandbox/webhooks, PCI scope,
3DS, partial refund, cuotas/costo, settlement y exit/manual reconciliation.

El conector debe modelar claramente la relación entre `PaymentIntent` interno, operación externa y
estado reconciliado. Una `capture` o `refund` parcial no puede reescribir el intent original; crea
suboperaciones o transiciones trazables con external IDs propios cuando el provider las materializa.

La integración no asume que todos los providers soportan exactamente las mismas capacidades. Cada
adapter declara soporte explícito para 3DS, cancelación previa a captura, partial refund, cuotas y
settlement details. Sin soporte demostrado, la capability permanece `NOT_SUPPORTED`.
