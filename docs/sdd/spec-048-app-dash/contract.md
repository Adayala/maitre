# Contrato de experiencia — SPEC-048

Dash es la superficie administrativa responsive actual para setup, overview, configuración básica,
subscription, auditoría y settings. Consume SPEC-045/046/047 y APIs de configuración; no replica
reglas de autorización ni considera ocultar controles como seguridad.

Estados obligatorios en el I0 materializado: loading con layout estable, empty accionable cuando
aplica y error recuperable con retry. Algunas pantallas no tienen empty state propio porque dependen
de respuestas siempre presentes (`overview`, `setup`). Navegación por teclado, skip link, landmarks,
focus, contraste y targets touch siguen según SPEC-212. Nunca muestra secretos ni PII innecesaria.
El I0 actual no implementa offline stale explícito ni estados parciales sofisticados por screen.
