# Especificación — SPEC-189 AnalyticsDashboard

Dashboard versionado refiere MetricDefinition publicadas, filtros allowlisted, layout, audience y
branch scope. Publicar congela refs/versions. Compartir nunca amplía permisos.

Cada widget reaplica autorización y privacy threshold, devuelve freshness/coverage/error propio y
puede degradar sin fallar todo el dashboard. Cache key incluye tenant, scopes, metric versions,
filters y suppression policy.
