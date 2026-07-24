# Especificación — SPEC-080 Reservations RBAC

## Permissions canónicas

```text
reservation.read
reservation.create
reservation.confirm
reservation.cancel
reservation.seat
reservation.no_show
waitlist.read
waitlist.create
waitlist.notify
waitlist.seat
waitlist.cancel
waitlist.expire
waitlist.priority_override
availability.read
guest.read
guest.write
guest_contact.write
guest_consent.write
guest_pii.read
guest_pii.write
guest.merge
guest.unmerge
guest.export
guest.anonymize
reservation_notification.request_confirmation
reservation_notification.send_reminder
reservation_notification.communicate_cancellation
cancellation_policy.override
```

MAITRE/MANAGER reciben assignments versionados según alcance por sucursal. Otros roles reciben
permisos explícitos; no se
introduce un string local `host`. WAITER sólo accede al contexto operativo necesario y no recibe
PII/export por default.

El canal público no es un rol ni Membership: usa capabilities opacas separadas por acción y
recurso, con hash at rest, expiración, revocación, single-use cuando corresponda, rate limit y
respuesta anti-enumeración. Overrides, export, anonymization y lectura masiva requieren auditoría;
nadie puede otorgarse a sí mismo permisos.

Guest read no implica Guest PII. Merge/unmerge, export/anonymize y priority/policy override
requieren reason; export, anonymize y PII/bulk sensible agregan step-up/approval según policy.
RBAC no reemplaza consent, retention, capacity, lifecycle, idempotencia ni revisión.
