# [SPEC-007] Tenants API

API HTTP para provisioning y administración controlada de Tenant, sin permitir enumeración global ni romper la raíz de aislamiento organizacional.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-007 |
| **Tipo** | API |
| **Dominio** | Organization |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Prioridad** | P0 |
| **Review target** | READY_FOR_I0_REVIEW |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Blockers** | Acordar provisioning autorizado, idempotencia y lifecycle de PATCH |
| **Fase** | I0 |

## Endpoints

- POST /tenants (crear)
- GET /tenants/:id (obtener)
- PATCH /tenants/:id (actualizar)

## Documentos

- [Contrato](./contract.md)
- [Objetivo](./objective.md)
- [Especificación](./specification.md)
- [Reglas](./rules.md)
- [Verificación](./verification.md)

## Relacionadas

- [SPEC-001 — Tenant](../spec-001-entity-tenant/README.md)
- [SPEC-013 — TenantCreated](../spec-013-event-tenant-created/README.md)
- [SPEC-016 — Organization RBAC](../spec-016-rbac-organization/README.md)
