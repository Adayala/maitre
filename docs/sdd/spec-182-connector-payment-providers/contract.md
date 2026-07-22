# Contrato de conector — SPEC-182 Payment Providers

Definir un puerto reemplazable para intent, capture, refund, cancel y reconciliation con
idempotencia end-to-end y montos decimales. Webhooks firmados son fuente de transición externa;
timeouts ambiguos se consultan antes de reintentar y datos de tarjeta nunca atraviesan Maitre.
Tests de contrato cubren éxito, rechazo, 3DS cuando aplique, duplicados, eventos tardíos,
refund parcial, rate limit, redacción y sandbox.
