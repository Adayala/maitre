# Contrato de cálculo — SPEC-134 Daily Settlement

Calcular por día de negocio, sucursal, moneda y medio de pago los saldos iniciales, ventas,
devoluciones, movimientos, depósitos y diferencias reconciliadas. El resultado usa decimales,
expone inputs y reglas, y es reproducible para una versión del ledger y timezone. Tests dorados
cubren medianoche, DST, cierres tardíos, múltiples cajas, compensaciones, monedas, redondeo,
eventos tardíos y reconciliación contable.
