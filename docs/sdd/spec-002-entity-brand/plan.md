# Plan de implementación — SPEC-002

## Estrategia general

Implementar Brand como entity de dominio Organization, con:
- CRUD API
- Event publication
- Multi-tenant isolation
- Configuration inheritance a Branches

## Componentes

| Componente | Descripción | Nuevo/Existente |
| --- | --- | --- |
| Brand entity | Modelo de dominio | Nuevo |
| brands table | Persistencia en BD | Nuevo |
| POST /brands | Crear | Nuevo |
| GET /brands/:id | Obtener | Nuevo |
| PATCH /brands/:id | Actualizar | Nuevo |
| GET /brands?tenantId=... | Listar | Nuevo |
| BrandCreated event | Domain event | Nuevo |
| AuditLog | Registrar cambios | Existente (SPEC-044) |

## Dependencias

**Must be DONE before:**
- SPEC-001 Tenant Entity ✅

**Depends on this:**
- SPEC-003 FiscalEntity
- SPEC-004 Branch
- SPEC-037 Menu

## Consideraciones técnicas

- Slug generation: lowercase, remove accents, replace spaces with hyphens
- Config JSONB: index para queries en language/currency
- Concurrency: optimistic locking en updates
- Isolation: all queries filtradas por tenant_id

## Alternativas consideradas

1. Slug vs ID: Slug es más legible en URLs (elegido)
2. Config in columns vs JSONB: JSONB permite flexibilidad (elegido)
3. Soft delete vs hard delete: Soft delete para auditoría (elegido: ARCHIVED status)
