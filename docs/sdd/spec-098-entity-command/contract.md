# Contrato — SPEC-098 Command

Command representa una unidad de trabajo de cocina con tipo, target, payload versionado,
priority, status `QUEUED | ACKNOWLEDGED | IN_PROGRESS | COMPLETED | CANCELLED | FAILED`,
idempotency key y auditoría. Transiciones requieren versión/actor autorizado; completion es
idempotente y failure conserva reason categorizado. Comandos no cruzan branch/station.
Tests cubren duplicados, concurrencia, retry, cancel race y orden parcial.
