# Plan — SPEC-215

## Fase 1 — Contratos compartidos

1. Aprobar convenciones y catálogo inicial de problem types.
2. Crear schemas para envelopes, Problem Details, contexto y paginación.
3. Generar OpenAPI y configurar lint/breaking-change checks.
4. Implementar correlation y error handler global.

## Fase 2 — Seguridad y contexto

1. Implementar verificación de sesión y `RequestContext`.
2. Validar tenant, branch, roles y entitlements.
3. Aplicar CORS, límites de payload, timeout y headers.
4. Probar acceso cross-tenant y redacción.

## Fase 3 — Resiliencia

1. Implementar port y persistencia de idempotencia.
2. Definir optimistic concurrency compartida.
3. Crear cliente web con timeouts, retry y parsing de problemas.
4. Añadir métricas de status, code, latencia y retry.

## Fase 4 — Adopción

1. Aplicar la spec a endpoints del walking skeleton.
2. Migrar las specs API por prioridad, sin cambio masivo ciego.
3. Agregar contract tests de consumidores críticos.
4. Publicar guía y ejemplos generados desde OpenAPI.
