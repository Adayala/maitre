# [SPEC-001] Tenant

Tenant representa una organización cliente y es la raíz explícita del aislamiento multi-tenant. Conserva identidad y defaults operativos; planes, cuotas y capacidades pertenecen a Subscription/Entitlement.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-001 |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Status** | DRAFT — RECONCILED FOR I0 REVIEW |
| **Prioridad** | P0 |
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

- [SPEC-004 — Branch](../spec-004-entity-branch/README.md)
- [SPEC-013 — TenantCreated](../spec-013-event-tenant-created/README.md)
- [SPEC-020 — Membership](../spec-020-entity-membership/README.md)
- [SPEC-027 — Subscription](../spec-027-entity-subscription/README.md)
- [SPEC-029 — Entitlement](../spec-029-entity-entitlement/README.md)
