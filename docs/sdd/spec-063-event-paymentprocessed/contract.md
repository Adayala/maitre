# Contrato del evento — SPEC-063

`payments.payment.processed.v1` representa resultado final relevante de Payment. Payload:
tenant/branch, payment/check/visit IDs, amount/currency, method categorizado, outcome,
provider reference opaca, processedAt y revision. Sin credenciales/PAN. Duplicados y
callbacks desordenados convergen por payment revision. Consumers no emiten invoice sin
validar reglas fiscales. Tests cubren redacción, retry, refund y reconciliación.
