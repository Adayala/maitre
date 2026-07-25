# Contrato API — SPEC-090 Digital Bill

Exponer por token público opaco una proyección de solo lectura de consumos, descuentos,
impuestos, pagos y saldo de una cuenta. El token expira, puede revocarse y nunca revela
PII, credenciales fiscales ni identificadores internos; la respuesta declara versión y
freshness. En I0 el contrato se satisface con un live snapshot del `Check`, incluyendo
`checkRevision`, `asOf`, `lastConfirmedAt`, `adjustments`, `paymentsSummary` y `totals`.
Emitir el token exige acceso al `Check` dentro del tenant y del scope de sucursal del actor.
Tests cubren token inválido, privacidad, freshness y aislamiento entre tenants/branches.
