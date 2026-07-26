# Especificación — SPEC-080 Reservations RBAC

## Permissions canónicas

```text
reservation:read
reservation:create
reservation:confirm
reservation:cancel
reservation:seat
reservation:no_show
waitlist:read
waitlist:manage
waitlist:priority_override
guest:pii_read
guest:pii_write
guest:export
guest:anonymize
reservation:notification_send
reservation:policy_override
```

`waitlist:manage` cubre create/notify/seat/cancel/expire del waitlist I0. Availability interna
usa hoy `reservation:read`; no existe un permiso materializado separado para availability. Guest
surface I0 expone sólo permisos PII/anonymize/export; no existen `guest.read/write/merge/unmerge`
como permisos independientes dentro de este bloque de reservas.

MAITRE/MANAGER reciben este set operativo dentro del alcance por sucursal. WAITER sólo accede al
contexto operativo mínimo: `reservation:read`, `reservation:seat`, `waitlist:read` y
`waitlist:manage`; no recibe PII/export por default. `waitlist:priority_override`,
`reservation:notification_send`, `guest:export`, `guest:anonymize` y
`reservation:policy_override` quedan reservados a roles elevados según el catálogo actual.

La separación de superficies queda definida así:

- consulta pública anónima puede existir para discovery/consulta previa (por ejemplo disponibilidad
  resumida por sucursal) sin materializar `Role`;
- cualquier acción que cree o muta identidad/comunicación del cliente — por ejemplo crear una
  reserva — requiere cliente autenticado o un capability equivalente explícitamente diseñado para
  ese flujo, nunca un acceso público implícito.

El canal público por capability para reservas no está materializado en I0: todas las rutas actuales
de reserva/waitlist usan Membership autenticada normal. Priority override requiere permiso dedicado
y reason en payload. RBAC no reemplaza lifecycle, capacity, retención, idempotencia ni revisión.
