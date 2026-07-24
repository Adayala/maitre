# [SPEC-016] Organization RBAC

Control de acceso en el dominio Organization (quién puede crear/editar tenant, brand, branch).

## Metadata
| Campo | Valor |
| --- | --- |
| **ID** | SPEC-016 |
| **Tipo** | RBAC |
| **Dominio** | Organization |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Prioridad** | P0 |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Fase** | 1 |
| **Estimación** | 4h |

**Roles:**
- OWNER: crear tenant, cambiar admin
- ADMIN: crear brand, fiscal entity, branch
- MANAGER: ver configuración

## Documentos

- [Contrato de autorización](contract.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Verificación](verification.md)
