# [SPEC-002] Brand

Brand representa la identidad comercial dentro de un Tenant. Agrupa sucursales bajo una misma marca y define defaults de presentación y operación comercial sin convertirse en un contenedor genérico de configuración.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-002 |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Review target** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Blockers** | Aprobar separación entre defaults de marca y overrides de sucursal |
| **Fase** | I0 |

## Documentos

- [Objetivo](./objective.md)
- [Especificación](./specification.md)
- [Estructura](./structure.md)
- [Reglas](./rules.md)
- [Plan](./plan.md)
- [Tareas](./tasks.md)
- [Verificación](./verification.md)

## Relacionadas

- [SPEC-001 — Tenant](../spec-001-entity-tenant/README.md)
- [SPEC-003 — FiscalEntity](../spec-003-entity-fiscal-entity/README.md)
- [SPEC-004 — Branch](../spec-004-entity-branch/README.md)
- [SPEC-008 — Brands API](../spec-008-api-brands/README.md)
- [SPEC-014 — BrandCreated](../spec-014-event-brand-created/README.md)
- [SPEC-037 — Menu](../spec-037-entity-menu/README.md)

## Contrato especializado

- [Contrato](./contract.md)
- [Jerarquía Tenant–Brand–Branch](../spec-001-entity-tenant/organization-hierarchy-contract.md)
