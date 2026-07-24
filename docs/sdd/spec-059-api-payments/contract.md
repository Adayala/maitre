# Contrato API — SPEC-059 Payments

`POST /v1/checks/{checkId}/payments` registra/inicia Payment con amount, currency, tip,
method y referencia permitida. `Idempotency-Key` es obligatoria; no se aceptan PAN/CVV.
Authorize, capture, void, refund y reconcile son comandos explícitos con revisión. Las
confirmaciones del provider ingresan por adapter autenticado, anti-replay y deduplicado; el
status del browser nunca es autoridad. Lecturas minimizan referencias. Tests cubren submit
y callback duplicados, timeout ambiguo, overpayment, refund/void autorizado, redacción y
tenant isolation.
