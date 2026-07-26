# Contrato API — SPEC-046

`GET /v1/dashboard/setup-status` devuelve checklist derivado de configuración autoritativa. En el
I0 real cubre sólo `tenant`, `brands`, `branches`, `users`, `menus` y `products`. Cada entrada se
expone dentro del mapa `setup` con `COMPLETE | INCOMPLETE | BLOCKED`, `count`, `required` y
`actionLink` opcional.

No persiste un porcentaje mutable ni marca pasos por clicks. Resultado depende de tenant y
scope y no revela recursos inaccesibles. I0 no implementa `ETag`, revisión ni freshness. Tests
cubren tenant sembrado completo, tenant vacío e inexistencia de contexto de tenant.
