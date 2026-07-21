# Contrato de experiencia — SPEC-048

Dash es la superficie administrativa responsive para setup y overview. Consume SPEC-046/047
y APIs de configuración; no replica reglas de autorización ni considera ocultar controles
como seguridad.

Estados obligatorios: loading con layout estable, empty accionable, partial/stale visible,
error recuperable y forbidden/not-found no enumerables. Navegación por teclado, landmarks,
focus, contraste WCAG 2.2 AA y targets touch según SPEC-212. Nunca muestra secretos ni PII
innecesaria. Tests cubren rutas críticas, permisos, responsive, axe, retry y analytics
sanitizada; offline es read-only stale explícito si existe cache.
