# Contrato API — SPEC-090 Digital Bill

Exponer por token público opaco una proyección de solo lectura de consumos, descuentos,
impuestos, pagos y saldo de una cuenta. El token expira, puede revocarse y nunca revela
PII, credenciales fiscales ni identificadores internos; la respuesta declara versión y
freshness. Tests cubren pagos concurrentes, cuenta cerrada, token filtrado o vencido,
redondeo, cache-control, privacidad y aislamiento entre tenants.
