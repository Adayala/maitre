# Contrato API — SPEC-059 Payments

`POST /v1/checks/{checkId}/payments` registra/inicia Payment con amount, currency, tip,
method y referencia permitida. `Idempotency-Key` es obligatoria; no se aceptan PAN/CVV.
Authorize, capture, void, refund y reconcile son comandos explícitos con revisión. Las
confirmaciones del provider ingresan por adapter autenticado, anti-replay y deduplicado; el
status del browser nunca es autoridad. Lecturas minimizan referencias. Tests cubren submit
y callback duplicados, timeout ambiguo, overpayment, refund/void autorizado, redacción y
tenant isolation.

`POST /v1/payments/{paymentId}/capture` acepta opcionalmente
`{ "cashSessionId": "uuid" }`. Para métodos distintos de `CASH` el campo no altera la
captura. Para `CASH`, la sesión debe estar `OPEN` y coincidir en tenant, sucursal y moneda;
sin ID sólo se autoselecciona una única sesión compatible. La captura y sus retries
convergen en un único movimiento `CASH_SALE` identificado por
`FLOOR_PAYMENT:{paymentId}`.
