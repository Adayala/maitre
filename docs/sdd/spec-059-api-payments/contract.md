# Contrato API — SPEC-059 Payments

`POST /v1/checks/{id}/payments` registra/inicia Payment con amount, currency, method y
referencia permitida. Idempotency-Key es obligatoria; no se aceptan PAN/CVV. Confirmaciones
de provider usan adapter/webhook autenticado y reconciliación, no status confiado del
browser. Lecturas minimizan referencias. Tests cubren duplicate submit/webhook, timeout
ambiguo, overpayment, refund/void autorizado, redacción y tenant isolation.
