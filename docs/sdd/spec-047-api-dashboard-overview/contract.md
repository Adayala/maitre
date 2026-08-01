# Contrato API — SPEC-047

`GET /v1/dashboard/overview` entrega un resumen acotado al tenant y las sucursales autorizadas. La
respuesta materializada contiene `setup`, `operations` y `lastUpdated`.

`setup` declara `AVAILABLE` con nombre de tenant y conteos de brands/branches. `operations` declara
`AVAILABLE` con visitas abiertas, mesas ocupadas, órdenes activas y pagos pendientes derivados de
los repositorios autoritativos. Si cualquiera de esas fuentes falla, sólo `operations` pasa a
`UNAVAILABLE`, incluye un `reason` estable y usa `null`; no fabrica ceros ni expone PII.

El contrato todavía no implementa ETag, metadata completa de freshness ni secciones parciales
tipadas. Tests cubren los conteos reales y la degradación explícita.
