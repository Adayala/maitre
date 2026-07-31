# Tareas — SPEC-215

- [ ] Aprobar SPEC-215 y actualizar la guía API.
- [x] Crear schemas de envelopes y Problem Details RFC 9457.
- [x] Definir catálogo versionado de `type` y `code`.
- [ ] Crear `RequestContext` inmutable.
- [x] Implementar middleware de auth/contexto y error handler.
- [x] Implementar correlation y propagación `traceparent`.
- [ ] Configurar CORS, límites de body y timeouts.
- [ ] Crear paginación por cursor reutilizable.
- [ ] Crear port/store de idempotencia.
- [ ] Probar replay, payload conflict y concurrencia de keys.
- [ ] Crear soporte ETag/If-Match para recursos que lo requieran.
- [ ] Implementar cliente web tipado con abort/timeout/retry seguro.
- [x] Generar OpenAPI y bloquear drift.
- [x] Añadir lint de OpenAPI y detector de breaking changes.
- [x] Aplicar convenciones a los endpoints de SPEC-213.
- [x] Añadir tests negativos de autorización cross-tenant.

El corte MVP implementa CORS por allowlist exacta y validación fail-closed del runtime compartido.
La tarea combinada de CORS, límites de body y timeouts permanece abierta hasta cubrir también los
dos últimos controles. Paginación, idempotencia genérica, ETag y el cliente web resiliente son
alcance más amplio de SPEC-215 y no forman parte del cierre documentado.
