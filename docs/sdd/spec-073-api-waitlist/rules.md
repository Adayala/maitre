# Reglas — SPEC-073

- Notify no reserva capacidad.
- Seat adquiere allocation y Visit atómicamente.
- Orden usa policy versionada, arrival sequence y aging.
- Override requiere permiso/reason/expiry y no usa atributos sensibles.
- Tenant/actor derivan del contexto y Branch de ruta debe pertenecer al scope.
- Timestamps, arrivalSequence, status y orden nunca provienen del cliente.
- `404` oculta scope, `409` expresa capacity/idempotency, `412` revisión y `422` transición.
