# Especificación — SPEC-066 Reservation y CapacityAllocation

Lifecycle: `PENDING -> CONFIRMED | CANCELLED | EXPIRED`; `CONFIRMED -> SEATED | CANCELLED |
NO_SHOW`; `SEATED -> COMPLETED` cuando la Visit vinculada cierra. NO_SHOW sólo revierte con permiso,
reason y capacidad revalidada. SEATED no se cancela: se corrige Visit/Check por sus workflows.

CapacityHold/Allocation es autoridad: Branch, `[start,end)`, unidades (tables o pool policy), party
size, status HELD/CONFIRMED/RELEASED/EXPIRED, expiry y revision. Confirm bloquea unidades/constraint,
valida SPEC-079 y convierte hold atómicamente. Cancel/expire/no-show libera en la misma transacción.
Seating asocia allocation con Occupancy/Visit una sola vez. Availability/TableStatus son proyecciones.
