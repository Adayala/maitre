# Especificación — SPEC-109 Kitchen RBAC

Permisos: `kitchen.queue.read`, `kitchen.command.claim`, `start`, `hold`, `ready`, `handoff`,
`cancel`, `transfer`, `reprioritize`; `kitchen.station.manage`; `kitchen.alert.acknowledge`,
`resolve`, `escalate`.

COOK recibe operaciones de producción según station scope; MAITRE/MANAGER administra routing y
excepciones. Expediter es assignment de permisos, no rol local. Si Workforce/turno no está
disponible se deniegan commands con ownership obligatorio; lectura degradada puede continuar.
Overrides exigen motivo y auditoría; revocación invalida autorización.
