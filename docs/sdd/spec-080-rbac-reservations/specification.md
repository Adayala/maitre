# Especificación — SPEC-080 Reservations RBAC

## Permisos canónicos

- `reservation.read`, `reservation.create`, `reservation.confirm`, `reservation.cancel`,
  `reservation.seat`, `reservation.no_show`.
- `waitlist.read`, `waitlist.manage`, `waitlist.priority.override`.
- `guest.pii.read`, `guest.pii.write`, `guest.export`, `guest.anonymize`.
- `reservation.notification.send` y `reservation.policy.override`.

MAITRE/MANAGER reciben el set según branch scope. Otros roles reciben permisos explícitos; no se
introduce un string local `host`. WAITER sólo accede al contexto operativo necesario y no recibe
PII/export por default.

El canal público no es un rol ni Membership: usa capabilities opacas separadas por acción y
recurso, con hash at rest, expiración, revocación, single-use cuando corresponda, rate limit y
respuesta anti-enumeración. Overrides, export, anonymization y lectura masiva requieren auditoría;
nadie puede otorgarse a sí mismo permisos.
