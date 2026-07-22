# [SPEC-007] Tenants API

HTTP endpoints para crear, obtener y actualizar tenants.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-007 |
| **Título** | Tenants API |
| **Tipo** | API |
| **Dominio** | Organization |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Fase** | 1 |
| **Estimación** | 8h |

## Endpoints

- POST /tenants (crear)
- GET /tenants/:id (obtener)
- PATCH /tenants/:id (actualizar)

## Related Specs

**Depends on:** [SPEC-001] Tenant Entity ✅

## Documentos normativos

- [Contrato](contract.md)
