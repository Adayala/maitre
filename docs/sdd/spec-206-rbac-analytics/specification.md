# Especificación — SPEC-206 Analytics/AI RBAC

Permisos separados: aggregate read, drill-down, raw/export; metric design/publish; dashboard
manage; alert manage; model register/evaluate/approve/activate; prediction run; automation
preview/approve/execute; data registry manage.

`analyst`, `ML admin`, `tenant admin` no son roles locales: assignments versionados + branch/data
classification scope. Evaluator/approver/activator y automation requester/approver se segregan.
Cada widget/query/retrieval/tool reaplica authorization; revocation invalida sessions/cache.

El dominio sigue deny-by-default y scope fino por tenant, branch y clasificación de datos. Un usuario
puede ver agregados sin poder hacer drill-down, exportar raw, diseñar métricas o correr predicciones.
Las surfaces AI reutilizan esta matriz y no pueden ampliar alcance por mera intermediación del modelo.

La segregación de funciones aplica tanto a modelos como a automatización: quien pide o evalúa no es
quien aprueba o activa cuando la policy lo requiera. La revocación debe cortar no sólo sesiones sino
también caches, tokens de retrieval y artifacts derivados que dependan del permiso removido.
