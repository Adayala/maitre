# Especificación — SPEC-102 Commands API

Detail y commands explícitos `claim`, `release`, `start`, `hold`, `resume`, `mark-ready`,
`complete-handoff`, `rollback`, `cancel`, `transfer` y `reprioritize`. Además existe el listado
de Commands por Order para drivear el flujo de producción. No existe `PATCH status`.

Cada mutación exige permiso y aplica la tabla SPEC-110. El I0 actual no exige `If-Match` ni
idempotency key; los conflictos de transición/ownership/routing se expresan como `409`. Transfer
conserva `Command ID`. Las respuestas devuelven el agregado simple; no hay redacción adicional por
permiso dentro de este surface.

El surface incluye al menos list por station/branch autorizado, detail por `commandId` y comandos
explícitos por recurso. No existe endpoint genérico de patch de estado ni mutación parcial opaca:
cada transición se expresa con verbo de negocio (`claim`, `start`, `hold`, `resume`,
`mark-ready`, `complete-handoff`, `cancel`, `transfer`, `reprioritize`).

El I0 real expone:

- `GET /v1/kitchen/commands/:id`
- `GET /v1/orders/:orderId/kitchen/commands`

La vista exitosa no habilita mutación sin nueva validación. Fuera de scope, detail usa `404`.
No hay metadata adicional de refresh/version además del `revision` del agregado.

`transfer` cambia station ownership sin cambiar `commandId`, preservando trazabilidad, revisiones y
correlación histórica. Debe validar compatibilidad básica de destino y disponibilidad operativa. El
I0 actual no implementa expected revision ni dual-check adicional de ownership más allá de las
precondiciones del agregado y la validez de la Station destino.
