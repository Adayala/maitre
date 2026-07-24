# Verificación — SPEC-182

## Criterios

### CAD-182-01 — El port cubre flows de pago con idempotencia y authority matrix explícitas

- [ ] el port cubre intent/capture/refund/cancel/query/reconcile con idempotencia.

### CAD-182-02 — El provider es autoridad de resultado externo; Maitre de amount/currency/intent

- [ ] la authority matrix separa resultado externo de amount/currency/intent local.

### CAD-182-03 — Timeout ambiguo exige query/reconcile antes de cualquier retry material

- [ ] timeout ambiguo exige query/reconcile antes de retry material.

### CAD-182-04 — Webhook firmado actualiza una sola transición lógica por external operation ID

- [ ] webhook firmado no duplica transiciones por external operation ID.

### CAD-182-05 — PAN/CVV nunca atraviesa Maitre y cada provider exige spike `PASS` completo

- [ ] PAN/CVV no atraviesa Maitre y el spike `PASS` cubre capacidades/PCI.

### CAD-182-06 — La aprobación exige evidencia de flows, timeout ambiguo y boundary PCI

- [ ] fixtures cubren flows, timeout, firma e idempotencia.
