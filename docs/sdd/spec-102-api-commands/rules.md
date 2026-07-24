# Rules — SPEC-102

- No existe `PATCH status`; sólo comandos explícitos de negocio.
- Toda mutación valida expected revision, scope y permission antes de ejecutar.
- `409` cubre ownership/idempotency conflict; `412` revisión; `422` transición inválida.
- Transfer debe ser atómica y auditada, preservando `commandId`.
- Detail fuera de scope usa `404`; collections filtran antes de paginar.
