# Contrato API — SPEC-008

Rutas `/v1/brands` crean/listan y `/v1/brands/{id}` obtiene/PATCH. Tenant viene del contexto;
create usa Idempotency-Key y PATCH If-Match. Filtros status, cursor y orden estable. No hard
delete: inactivación valida branches/publicaciones activas.

Bodies aceptan sólo campos configurables y rechazan tenantId/credenciales. 404 cubre
cross-tenant, 409 slug/idempotencia, 412 versión y 422 lifecycle. SPEC-016 gobierna permisos;
tests cubren normalización, paginación, concurrencia, auditoría y OpenAPI.
