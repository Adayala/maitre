# Especificación — SPEC-122 Workforce RBAC

Permisos: `workshift.read_own`, `plan`, `assign`; `time.clock`, `time.read_own`, `time.adjust.request`,
`time.adjust.approve`, `time.read_sensitive`, `time.export`; `labor_policy.manage/review`.

`employee`, `supervisor` y `payroll` no son roles locales: Employment + assignments de permisos
versionados determinan alcance. Datos de jornada/remuneración son sensibles. Requester y approver
de un ajuste deben ser distintos cuando la policy lo exige. Export requiere step-up y audit.

Permissions canónicas I0:

```text
workshift.read_own
workshift.plan
workshift.assign
time.clock
time.read_own
time.adjust.request
time.adjust.approve
time.read_sensitive
time.export
labor_policy.manage
labor_policy.review
```

La autorización combina Membership/credenciales de sistema con Employment y alcances laborales
aprobados. `workshift.read_own` y `time.read_own` operan sobre la propia relación laboral; lectura
sensible y export requieren alcances más fuertes, branch constraints y justificación/auditoría. Un
assignment de tipo `payroll` no implica permiso para modificar planificación si no se asignó
explícitamente.
