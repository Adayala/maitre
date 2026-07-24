# Especificación — SPEC-189 AnalyticsDashboard

Dashboard versionado refiere MetricDefinition publicadas, filtros allowlisted, layout, audience y
alcance por sucursal. Publicar congela refs/versiones. Compartir nunca amplía permisos.

Cada widget reaplica autorización y privacy threshold, devuelve freshness/coverage/error propio y
puede degradar sin fallar todo el dashboard. Cache key incluye tenant, alcances, metric versions,
filters y suppression policy.

La entidad incluye `analyticsDashboardId`, `widgetRefs`, `layout`, `audience`, `scopePolicy`,
`filterAllowlist`, `status`, `publishedVersion`, `createdAt`, `updatedAt` y `revision`. Los widgets
referencian métricas publicadas por ID/version, no “la última”, para evitar deriva semántica.

La vista completa del dashboard es una composición tolerante a fallas parciales. Un widget con
`stale`, `suppressed` o `error` no invalida por sí mismo los demás, pero cada respuesta debe hacer
explícito su estado para no engañar al consumidor sobre frescura o disponibilidad.
