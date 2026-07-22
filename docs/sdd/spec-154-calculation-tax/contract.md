# Contrato de cálculo — SPEC-154 Tax

Calcular base, IVA y tratamientos exento/no gravado por línea y total usando decimales,
alícuotas versionadas y regla de redondeo explícita. El resultado expone ecuaciones, residuos
y snapshot de inputs; ningún subtotal o impuesto del cliente se considera autoritativo. Tests
dorados cubren múltiples alícuotas, descuentos, cantidades fraccionarias, notas de crédito,
moneda, mínimos, redondeo y reconciliación exacta.
