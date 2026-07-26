# Contrato RBAC — SPEC-080

MAITRE/MANAGER pueden recibir assignments para reservas y waitlist dentro de alcance por sucursal;
cualquier rol opera sólo mediante permisos canónicos explícitos. En I0 materializado los nombres
efectivos usan formato `resource:action`: `reservation:*`, `waitlist:read|manage|priority_override`,
`guest:pii_read|pii_write|export|anonymize`, `reservation:notification_send` y
`reservation:policy_override`. WAITER conserva sólo el subset operativo y no accede a Guest PII ni
notification send. El canal público por capability no está materializado todavía; todas las rutas
usan Membership autenticada. Tests cubren permission denial para waitlist priority override,
guest lookup PII y reservation notifications.
