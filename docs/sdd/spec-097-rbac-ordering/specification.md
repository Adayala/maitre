# Especificación — SPEC-097 Ordering RBAC

Permisos: `order.read`, `order.create`, `order.submit`, `order.modify`, `order.cancel`,
`order.cancel_prepared`, `kitchen.line.start`, `kitchen.line.ready`, `order.deliver`,
`special_request.review` y `order.audit.read`.

Roles canónicos reciben assignments versionados: WAITER opera Order dentro de sucursal/ownership;
COOK opera líneas asignadas a station; CASHIER sólo consulta lo necesario para Check; MANAGER
autoriza excepciones. `customer` no es rol: el público usa capability. `kitchen` no es rol: se usa
COOK + alcance de station. Si falta ownership de turno, se deniega la operación restringida.

Cancelación preparada, overrides y cambios de asignación requieren motivo y auditoría. Revocación
de Membership/permisos invalida autorización activa; no existe auto-escalamiento.

Permissions canónicas I0:

```text
order.read
order.create
order.submit
order.modify
order.cancel
order.cancel_prepared
kitchen.line.start
kitchen.line.ready
order.deliver
special_request.review
order.audit.read
```

WAITER opera Orders dentro de `branchId` y ownership/turno aprobados; COOK actúa sólo sobre líneas
de stations asignadas; CASHIER lee el mínimo necesario para coordinación con Check; MANAGER aprueba
excepciones como cancelación preparada, overrides y reasignaciones. Ningún perfil concede por sí
solo acceso cross-branch, PII ampliada o autoasignación.

El canal público usa capabilities opacas separadas (`MENU_READ`, `BILL_READ`, `ORDER_TRACK_READ`),
no Membership ni rol `customer`. Tampoco existe rol `kitchen`: la operación de cocina se modela con
COOK más scope de station. Cuando una precondición de assignment, shift u ownership falta, la
operación restringida se deniega aunque la permission nominal exista.
