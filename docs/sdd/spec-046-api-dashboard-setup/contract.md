# Contrato API — SPEC-046

`GET /v1/dashboard/setup-status` devuelve checklist derivado de configuración autoritativa:
tenant, fiscal entity, branch, salon/table, menu y memberships mínimas. Cada item contiene
code estable, `COMPLETE | INCOMPLETE | BLOCKED`, action link permitido y reason codes.

No persiste un porcentaje mutable ni marca pasos por clicks. Resultado depende de tenant y
scope, usa ETag/revisión y no revela recursos inaccesibles. Tests cubren estado vacío,
parcial, completo, regresión al desconfigurar y cross-tenant.
