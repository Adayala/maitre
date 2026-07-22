# Contrato API — SPEC-166 Reputation Dashboard

Consultar métricas de reputación, tendencias, distribución, temas y cobertura por sucursal,
fuente y período. Cada respuesta declara timezone, freshness, fórmula y supresiones aplicadas;
los drill-downs respetan mínimos de privacidad. Tests cubren períodos vacíos, fuentes tardías,
comparaciones, paginación, caché, permisos por sucursal, supresión estadística y aislamiento.
