# Objetivo — SPEC-181

Definir la API de tests de capacidades de integración como command gobernado, no genérico, con side
effects explícitos y ambientes permitidos.

## Criterios de aceptación

### CAD-181-01 — No existe test genérico; cada adapter declara capabilities y constraints

no existe test genérico; cada adapter declara sus test capabilities, side effects,
fixtures, cleanup, timeout, rate/budget y redacción.

### CAD-181-02 — Producción restringe tests a health/read-only probados; side effects van a sandbox

producción sólo permite tests read-only o health probados; tests que crean objetos quedan
limitados a sandbox con cleanup verificable.

### CAD-181-03 — Todas las URLs involucradas pasan SSRF policy

todas las URLs involucradas pasan SSRF policy.

### CAD-181-04 — El command exige step-up, permiso, idempotencia y auditoría

el command requiere step-up, permiso, idempotencia y auditoría.

### CAD-181-05 — Resultados normalizan checks/limitations sin secrets ni raw responses

el resultado normaliza checks y limitaciones sin incluir secretos ni raw responses.

### CAD-181-06 — La aprobación exige evidencia de `NOT_SUPPORTED`, sandbox/prod y cleanup

La aprobación exige fixtures de `NOT_SUPPORTED`, sandbox vs producción, SSRF, cleanup
verificable, budget y redacción.
