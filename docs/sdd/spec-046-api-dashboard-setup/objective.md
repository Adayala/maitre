# Objetivo — SPEC-046

## Propósito

Exponer un checklist derivado y versionado de configuración mínima del tenant para orientar
onboarding sin persistir progreso ficticio ni revelar recursos fuera del alcance.

## Criterios de aceptación

### CAD-046-01 — `GET /v1/dashboard/setup-status` deriva tenant/alcance server-side y exige permiso de setup read

`GET /v1/dashboard/setup-status` deriva tenant/alcance server-side y exige permiso de setup read.

### CAD-046-02 — Cada item usa code estable, estados explícitos, reason codes y evidence refs mínimas

Cada item usa code estable, `COMPLETE | INCOMPLETE | BLOCKED`, reason codes, evidence refs mínimas y
action link allowlisted.

### CAD-046-03 — El estado se calcula desde autoridades de dominio y no desde clicks o cache cliente

Estado se calcula desde autoridades de Tenant/FiscalEntity/Branch/Salon/Table/Menu/Membership y no
desde clicks, porcentaje o cache cliente.

### CAD-046-04 — Desconfigurar una dependencia hace regresar el item de forma determinista

Desconfigurar una dependencia hace regresar el item de forma determinista y no conserva COMPLETE
stale.

### CAD-046-05 — ETag, revision y freshness hacen visible cache/staleness

ETag/revision/freshness hacen visible cache/staleness; una dependencia unavailable no se presenta
como INCOMPLETE confirmado.

### CAD-046-06 — Empty, partial, complete, regression, permisos y cross-tenant poseen resultados verificables

Empty/partial/complete/regression, permisos y cross-tenant poseen resultados verificables sin PII ni
conteos innecesarios.
