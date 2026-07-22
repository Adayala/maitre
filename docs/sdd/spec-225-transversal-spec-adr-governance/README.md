# [SPEC-225] Specification & ADR Governance

Contrato transversal para crear, revisar, aprobar, cambiar, verificar y retirar especificaciones y decisiones arquitectónicas de Maitre.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-225 |
| **Tipo** | Transversal |
| **Subtype** | Engineering Governance |
| **Dominio** | Product / Architecture / Engineering |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | PROPOSED_FOR_REVIEW |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | Antes de marcar specs como READY_FOR_IMPLEMENTATION |
| **Depende de** | SPEC-207, SPEC-221, SPEC-222 |

## Decisiones centrales

- IDs de specs y ADRs son únicos, inmutables y nunca se reutilizan.
- Sólo `READY_FOR_IMPLEMENTATION` autoriza implementación de comportamiento nuevo.
- `VERIFIED` requiere evidencia de código desplegable y criterios de aceptación.
- Cambios incompatibles reabren revisión y actualizan consumidores.
- Conflictos entre fundamentos, specs y código bloquean el avance hasta resolverse explícitamente.
- ADRs explican decisiones; specs describen contratos verificables.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Contrato del validador](validation-contract.md)
- [Contrato del registro](registry-contract.md)
- [Contrato del registro ADR](adr-registry-contract.md)
- [Protocolo de revisión de contratos](contract-review-checklist.md)
- [Revisión Organization SPEC-001–016](reviews/organization-spec-001-016.md)
- [Auditoría inicial del registro](registry-baseline-audit.md)
- [Decisiones](notes.md)
