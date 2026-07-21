# [SPEC-020] Membership Entity

Vínculo de autorización entre un User global y un Tenant, con roles y alcance por sucursal normalizados.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-020 |
| **Tipo** | Entity / Authorization Aggregate |
| **Dominio** | Identity |
| **Estado** | DRAFT |
| **Readiness** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Fase** | SPEC-222 I0/I1 |
| **Depende de** | SPEC-001, SPEC-004, SPEC-017, SPEC-018, SPEC-019, SPEC-023 |

## Decisión principal

Membership contiene el vínculo User ↔ Tenant. Roles y branches se modelan como assignments/scopes relacionados; no se guardan en User ni se confía en claims editables del cliente.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
