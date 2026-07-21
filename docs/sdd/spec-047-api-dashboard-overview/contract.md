# Contrato API — SPEC-047

`GET /v1/dashboard/overview` entrega resumen acotado para el tenant/branch scope: setup,
operación activa, alertas y métricas disponibles. Cada sección declara `asOf`, freshness y
estado `AVAILABLE | PARTIAL | UNAVAILABLE`; una dependencia fallida no fabrica cero.

Respuesta se compone con timeouts/budget, evita N+1 y PII, y permite ETag. Permisos filtran
secciones, no sólo filas. Tests cubren datos parciales/stale, scope, timeout, cache y
degradación según SPEC-216.
