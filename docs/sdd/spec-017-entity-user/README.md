# [SPEC-017] User Entity

Perfil global de una persona autenticada, separado de credenciales, tenants, roles y permisos.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-017 |
| **Tipo** | Entity |
| **Dominio** | Identity |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Review target** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | SPEC-222 I0/I1 |
| **Depende de** | IdentityProviderPort, SPEC-020, SPEC-023, SPEC-210 |

## Decisión principal

`User` es global y representa el perfil de dominio. No almacena password, hash, refresh token, tenant, role ni branch. Las credenciales pertenecen al proveedor de identidad; la autorización pertenece a Membership y sus assignments.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)

## Contrato especializado

- [Contrato](contract.md)
