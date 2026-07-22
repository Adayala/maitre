# Especificación — SPEC-097 Ordering RBAC

Permisos: `order.read`, `order.create`, `order.submit`, `order.modify`, `order.cancel`,
`order.cancel_prepared`, `kitchen.line.start`, `kitchen.line.ready`, `order.deliver`,
`special_request.review` y `order.audit.read`.

Roles canónicos reciben assignments versionados: WAITER opera Order dentro de branch/ownership;
COOK opera líneas asignadas a station; CASHIER sólo consulta lo necesario para Check; MANAGER
autoriza excepciones. `customer` no es rol: el público usa capability. `kitchen` no es rol: se usa
COOK + station scope. Si falta ownership de turno, se deniega la operación restringida.

Cancelación preparada, overrides y cambios de asignación requieren motivo y auditoría. Revocación
de Membership/permisos invalida autorización activa; no existe auto-escalamiento.
