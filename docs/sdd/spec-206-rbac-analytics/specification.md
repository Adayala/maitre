# Especificación — SPEC-206 Analytics/AI RBAC

Permisos separados: aggregate read, drill-down, raw/export; metric design/publish; dashboard
manage; alert manage; model register/evaluate/approve/activate; prediction run; automation
preview/approve/execute; data registry manage.

`analyst`, `ML admin`, `tenant admin` no son roles locales: assignments versionados + branch/data
classification scope. Evaluator/approver/activator y automation requester/approver se segregan.
Cada widget/query/retrieval/tool reaplica authorization; revocation invalida sessions/cache.
