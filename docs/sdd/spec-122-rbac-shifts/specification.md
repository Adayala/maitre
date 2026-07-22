# Especificación — SPEC-122 Workforce RBAC

Permisos: `workshift.read_own`, `plan`, `assign`; `time.clock`, `time.read_own`, `time.adjust.request`,
`time.adjust.approve`, `time.read_sensitive`, `time.export`; `labor_policy.manage/review`.

`employee`, `supervisor` y `payroll` no son roles locales: Employment + assignments de permisos
versionados determinan alcance. Datos de jornada/remuneración son sensibles. Requester y approver
de un ajuste deben ser distintos cuando la policy lo exige. Export requiere step-up y audit.
