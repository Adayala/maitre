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
- [Contrato de evidencia de implementación](implementation-evidence-contract.md)
- [Registro de revisiones y findings](reviews/README.md)
- [Revisión Organization SPEC-001–016](reviews/organization-spec-001-016.md)
- [Revisión Identity SPEC-017–026](reviews/identity-spec-017-026.md)
- [Revisión Subscription SPEC-027–036](reviews/subscription-spec-027-036.md)
- [Revisión Catalog SPEC-037–043](reviews/catalog-spec-037-043.md)
- [Revisión Audit/Dashboard SPEC-044–048](reviews/audit-dashboard-spec-044-048.md)
- [Revisión Floor Core SPEC-049–054](reviews/floor-core-spec-049-054.md)
- [Revisión Floor APIs/Events SPEC-055–065](reviews/floor-api-events-spec-055-065.md)
- [Revisión Reservations Core SPEC-066–070](reviews/reservations-core-spec-066-070.md)
- [Revisión Reservations APIs/Events SPEC-071–080](reviews/reservations-api-events-spec-071-080.md)
- [Revisión Ordering Core SPEC-081–086](reviews/ordering-core-spec-081-086.md)
- [Revisión Ordering APIs/Events SPEC-087–097](reviews/ordering-api-events-spec-087-097.md)
- [Revisión Kitchen SPEC-098–110](reviews/kitchen-spec-098-110.md)
- [Revisión Workforce SPEC-111–123](reviews/workforce-spec-111-123.md)
- [Revisión Cash Management SPEC-124–136](reviews/cash-spec-124-136.md)
- [Revisión Fiscal/ARCA SPEC-137–156](reviews/fiscal-arca-spec-137-156.md)
- [Revisión Feedback/Reputation SPEC-157–171](reviews/feedback-reputation-spec-157-171.md)
- [Revisión Integrations SPEC-172–186](reviews/integrations-spec-172-186.md)
- [Revisión Analytics/AI SPEC-187–206](reviews/analytics-ai-spec-187-206.md)
- [Revisión Platform/Governance SPEC-207–226](reviews/platform-transversal-spec-207-226.md)
- [Auditoría inicial del registro](registry-baseline-audit.md)
- [Decisiones](notes.md)
