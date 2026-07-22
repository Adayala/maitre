# Especificación — SPEC-090 Digital Bill API

`GET /public/bills/{token}` acepta sólo capability `BILL_READ` y devuelve la proyección SPEC-085:
`checkRevision`, `asOf`, líneas, descuentos, impuestos, total, pagos agregados, saldo y status.

El token es hasheado, revocable, expirable, rate-limited y distinto de Menu/Tracking/Payment. No
se confían tenant/check IDs del cliente. Se omiten PII, instrumentos y provider references. La
respuesta declara freshness y usa cache-control restrictivo; no habilita mutaciones.
