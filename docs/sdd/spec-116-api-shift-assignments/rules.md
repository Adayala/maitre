# Reglas — SPEC-116

- Toda mutación usa idempotencia y revisión esperada.
- Employment vigente, sucursal elegible y policy conflict se revalidan transaccionalmente.
- `reassign` es atómica entre cancelación previa y creación nueva.
- Self-service y management no comparten la misma superficie de datos personales.
- Notificación es side effect por outbox, no precondición de éxito.
