# Especificación — SPEC-102 Commands API

List/detail y commands `claim`, `start`, `hold`, `resume`, `mark-ready`, `complete-handoff`,
`cancel`, `transfer` y `reprioritize`. No existe PATCH status.

Cada mutación exige `If-Match`, idempotency key, permiso y station scope; aplica la tabla SPEC-110.
Responde `412` por revisión, `409` por ownership/idempotencia y `422` por transición. Transfer es
atómica y conserva Command ID. Las respuestas redactan instrucciones sensibles según permiso.

El surface incluye al menos list por station/branch autorizado, detail por `commandId` y comandos
explícitos por recurso. No existe endpoint genérico de patch de estado ni mutación parcial opaca:
cada transición se expresa con verbo de negocio (`claim`, `start`, `hold`, `resume`,
`mark-ready`, `complete-handoff`, `cancel`, `transfer`, `reprioritize`).

List y detail siempre declaran `aggregateRevision` o metadata equivalente suficiente para que el
cliente tome decisiones de refresh, pero una vista exitosa no habilita mutación sin nueva
validación. Fuera de scope, detail usa `404`; colecciones filtran por tenant/branch/station antes
de paginar.

`transfer` cambia station ownership sin cambiar `commandId`, preservando trazabilidad, revisiones y
correlación histórica. Debe validar compatibilidad de destino, disponibilidad operativa y expected
revision en una sola unidad lógica; no se acepta estado intermedio visible con doble ownership.
