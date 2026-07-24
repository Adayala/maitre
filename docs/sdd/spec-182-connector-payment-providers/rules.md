# Reglas — SPEC-182

- Provider es autoridad del resultado externo.
- Maitre es autoridad de amount, currency y order intent.
- Timeout ambiguo obliga query/reconcile antes de retry.
- Webhooks firmados actualizan una sola transición por external operation ID.
- PAN/CVV nunca atraviesa Maitre.
