# Plan de implementación — SPEC-001

## Estrategia general

Implementar Tenant como entity principal de Organization domain:
- CRUD API con aislación multi-tenant
- Suscripción vinculada automáticamente
- Event publication
- AuditLog de cambios

## Componentes

| Componente | Descripción |
| --- | --- |
| Tenant entity | Modelo de dominio |
| tenants table | Persistencia en BD |
| POST /tenants | Crear (público) |
| GET /tenants/:id | Obtener (auth) |
| PATCH /tenants/:id | Actualizar (auth) |
| TenantCreated event | Domain event |
| Subscription auto-create | Vinculación automática |

## Dependencias

**Must be DONE:** Ninguna (foundational)

**Depends:** SPEC-002 Brand, SPEC-003 FiscalEntity, SPEC-004 Branch, SPEC-017 User

## Consideraciones

- Email validación y unicidad (índice unique global)
- Timezone IANA válido
- Suscripción se crea automáticamente en status TRIALING
- Owner user se crea automáticamente al registrar tenant
- Aislación: todas las queries filtradas por tenant_id
