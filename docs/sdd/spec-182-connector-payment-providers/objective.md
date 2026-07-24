# Objetivo — SPEC-182

Definir el conector de payment providers con autoridad compartida explícita, idempotencia por
operación y fuerte boundary PCI.

## Criterios de aceptación

### CAD-182-01 — El port cubre flows de pago con idempotencia y matriz de autoridad explícita

el port cubre `intent`, `capture`, `refund`, `cancel`, `query` y `reconcile` con
idempotency del provider y matriz de autoridad de Payment.

### CAD-182-02 — El provider es autoridad de resultado externo; Maitre de amount/currency/intent

el provider es autoridad de resultado externo; Maitre es autoridad de amount, currency y
order intent.

### CAD-182-03 — Timeout ambiguo exige query/reconcile antes de cualquier retry material

timeout ambiguo se resuelve con query/reconcile antes de cualquier retry material.

### CAD-182-04 — Webhook firmado actualiza una sola transición lógica por external operation ID

webhook firmado sólo puede actualizar una transición lógica por external operation ID.

### CAD-182-05 — PAN/CVV nunca atraviesa Maitre y cada provider exige spike `PASS` completo

PAN/CVV nunca atraviesa Maitre y cada provider requiere spike `PASS` de API/sandbox/
webhooks, PCI scope, 3DS, partial refund, cuotas/costo, settlement y exit/manual
reconciliation.

### CAD-182-06 — La aprobación exige evidencia de flows, timeout ambiguo y boundary PCI

La aprobación exige fixtures de intent/capture/refund, timeout ambiguo, webhook firmado,
idempotencia y boundary PCI.
