# Especificación — SPEC-182 Payment Provider Connector

Port intent/capture/refund/cancel/query/reconcile con provider idempotency y Payment authority matrix.
Provider es autoridad de resultado externo; Maitre de amount/currency/order intent. Timeout ambiguo se
consulta antes de retry. Webhook firmado actualiza una sola transición por external operation ID.

PAN/CVV nunca atraviesa Maitre. Cada provider requiere spike PASS de API/sandbox/webhooks, PCI scope,
3DS, partial refund, cuotas/costo, settlement y exit/manual reconciliation.
