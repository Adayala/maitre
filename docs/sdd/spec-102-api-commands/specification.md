# Especificación — SPEC-102 Commands API

List/detail y commands `claim`, `start`, `hold`, `resume`, `mark-ready`, `complete-handoff`,
`cancel`, `transfer` y `reprioritize`. No existe PATCH status.

Cada mutación exige `If-Match`, idempotency key, permiso y station scope; aplica la tabla SPEC-110.
Responde `412` por revisión, `409` por ownership/idempotencia y `422` por transición. Transfer es
atómica y conserva Command ID. Las respuestas redactan instrucciones sensibles según permiso.
