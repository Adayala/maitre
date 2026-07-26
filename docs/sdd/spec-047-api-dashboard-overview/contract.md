# Contrato API — SPEC-047

`GET /v1/dashboard/overview` entrega un resumen acotado del tenant. En el I0 real la respuesta
materializada contiene sólo `setup`, `operations` y `lastUpdated`.

`setup` declara `AVAILABLE` con nombre de tenant y conteos de brands/branches. `operations`
declara `UNAVAILABLE` con `reason` explícito y métricas operativas en `null` mientras esa
integración no exista. La respuesta no fabrica ceros operativos ni expone PII. I0 no implementa
ETag, freshness ni secciones parciales tipadas. Tests cubren disponibilidad de setup y degradación
explícita de operations.
