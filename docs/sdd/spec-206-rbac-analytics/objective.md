# Objetivo — SPEC-206

Definir el RBAC unificado de analytics/AI con scopes por branch/data classification y segregación para
modelos y automatización.

## Criterios de aceptación

### CAD-206-01 — Permisos se separan entre lectura, diseño, alertas, modelos, predicción y automation

Permisos quedan separados entre aggregate read, drill-down, raw/export, metric design/publish,
dashboard manage, alert manage, model register/evaluate/approve/activate, prediction run, automation
preview/approve/execute y data registry manage.

### CAD-206-02 — No hay roles locales implícitos; todo se expresa con assignments versionados y scope

`Analyst`, `ML admin` y `tenant admin` no son roles locales implícitos; se expresan con assignments
versionados y branch/data-classification scope.

### CAD-206-03 — Evaluator, approver, activator y automation requester/approver se segregan

Evaluator/approver/activator y automation requester/approver se segregan.

### CAD-206-04 — Cada widget, query, retrieval y tool reaplica authorization

Cada widget/query/retrieval/tool reaplica authorization y no amplía scopes previos.

### CAD-206-05 — Revocation invalida sesiones y cache derivada

Revocation invalida sessions y cache derivada.

### CAD-206-06 — La aprobación exige evidencia de deny-by-default, scopes, segregación y cache invalidation

La aprobación exige fixtures de deny-by-default, branch/classification scope, segregación de
funciones, reauth por widget/tool y cache invalidation.
