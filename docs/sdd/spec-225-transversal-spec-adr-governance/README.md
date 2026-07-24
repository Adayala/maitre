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
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
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

- [Contrato de roles y navegación documental](document-role-navigation-contract.md)
- [Contrato de metadata documental](document-metadata-envelope-contract.md)
- [Contrato de referencias documentales tipadas](document-reference-identity-contract.md)
- [Catálogo de fixtures DREF v1](document-reference-fixture-catalog.md)
- [Contrato de registro y asignación de document IDs](document-id-registry-allocation-contract.md)
- [Catálogo de fixtures DIDA v1](document-id-registry-fixture-catalog.md)
- [Catálogo de fixtures DOCM v1](document-metadata-fixture-catalog.md)
- [Piloto de metadata SDD-DOCM-001](document-metadata-pilot-manifest.md)
- [Contrato de preservación del body Markdown](document-body-preservation-contract.md)
- [Catálogo de fixtures DOCB v1](document-body-preservation-fixture-catalog.md)
- [Contrato de índices de subdirectorios](subdirectory-index-contract.md)
- [Catálogo de fixtures NAVD v1](subdirectory-index-fixture-catalog.md)
- [Registro de metadata de índices](subdirectory-index-metadata-register.md)
- [Contrato de links y reachability Markdown](markdown-link-reachability-contract.md)
- [Contrato de validación de links externos](external-link-validation-contract.md)
- [Catálogo de fixtures XURL v1](external-link-validation-fixture-catalog.md)
- [Contrato de renderer profile Markdown](markdown-renderer-profile-contract.md)
- [Contrato e inventario de consumidores Markdown](markdown-consumer-authority-contract.md)
- [Catálogo de conformidad del renderer Markdown](markdown-renderer-conformance-fixture-catalog.md)
- [Registro de validación de fragments Markdown](markdown-fragment-validation-register.md)
- [Manifest MD-RENDER-001](markdown-renderer-selection-manifest.md)
- [Contrato de evidencia de evaluación del renderer](markdown-renderer-evaluation-evidence-contract.md)
- [Catálogo de fixtures RSEL v1](markdown-renderer-evaluation-fixture-catalog.md)
- [Catálogo de fixtures NAVL v1](markdown-link-fixture-catalog.md)
- [Registro de remediación de links rotos](broken-link-remediation-register.md)
- [Línea base global de navegación](global-navigation-baseline.md)
- [Manifests NAV-01/NAV-02](navigation-remediation-manifests.md)
- [Contrato de navegación de índices globales](global-index-navigation-contract.md)
- [Contrato de evidencia de revisión documental](document-review-evidence-contract.md)
- [Catálogo de fixtures DOC-REV v1](document-review-fixture-catalog.md)
- [Contrato de lotes de migración documental](document-migration-batch-contract.md)
- [Contrato de snapshot baseline del worktree](worktree-baseline-snapshot-contract.md)
- [Catálogo de fixtures del snapshot schema v1](worktree-snapshot-fixture-catalog.md)
- [Manifest piloto SDD-SNAP-001](worktree-snapshot-pilot-manifest.md)
- [Schema de mappings de migración](migration-mapping-schema-contract.md)
- [Catálogo de fixtures del mapping schema v1](migration-mapping-fixture-catalog.md)
- [Piloto planificado SDD-MIG-001](migrations/sdd-mig-001-spec-225-pilot.md)
- [Contrato del grafo de trazabilidad](traceability-graph-contract.md)
- [Contrato de estructura y boundaries](structure-boundary-contract.md)
- [Contrato de versión y compatibilidad](contract-version-compatibility-contract.md)
- [Contrato de identidad y fuerza de requisitos](requirement-identity-contract.md)
- [Contrato de objetivos y outcomes](objective-outcome-contract.md)
- [Contrato de planes, hitos y estimaciones](plan-milestone-contract.md)
- [Contrato de identidad y trazabilidad de reglas](rule-identity-traceability-contract.md)
- [Contrato de identidad y trazabilidad de tareas](task-traceability-contract.md)
- [Contrato de identidad de criterios de aceptación](acceptance-criteria-identity-contract.md)
- [Registro de revisión retroactiva](retroactive-implementation-review-register.md)
- [Contrato de review targets y blockers](review-target-blocker-contract.md)
- [Contrato de lifecycle, readiness y blockers](lifecycle-readiness-contract.md)
- [Contrato de relaciones y dependencias](dependency-relation-contract.md)
- [Contrato de prioridad de specs](spec-priority-contract.md)
- [Contrato de asignación de ownership y revisión](ownership-assignment-contract.md)
- [Contrato de autoridad, competencia y delegación](authority-capability-delegation-contract.md)
- [Catálogo de fixtures OWNA v1](authority-capability-fixture-catalog.md)
- [Contrato del registro de ownership y autoridad](ownership-authority-registry-contract.md)
- [Catálogo de fixtures OWNR v1](ownership-authority-registry-fixture-catalog.md)
- [Contrato de readiness para activar gobernanza SDD](governance-activation-readiness-contract.md)
- [Catálogo de fixtures GACT v1](governance-activation-fixture-catalog.md)
- [Contrato de disponibilidad y continuidad del validator](validation-availability-continuity-contract.md)
- [Catálogo de fixtures VAVL v1](validation-availability-fixture-catalog.md)
- [Contrato de respuesta a incidentes del validator](validation-incident-response-contract.md)
- [Catálogo de fixtures VINC v1](validation-incident-response-fixture-catalog.md)
- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Contrato del validador](validation-contract.md)
- [Contrato de baseline de deuda histórica](historical-validation-debt-baseline-contract.md)
- [Catálogo de fixtures SDBL v1](historical-validation-debt-baseline-fixture-catalog.md)
- [Contrato del repositorio de baselines históricos](historical-baseline-repository-contract.md)
- [Catálogo de fixtures SDBS v1](historical-baseline-repository-fixture-catalog.md)
- [Contrato de excepciones de deuda de validación](validation-debt-exception-governance-contract.md)
- [Catálogo de fixtures SDEX v1](validation-debt-exception-fixture-catalog.md)
- [Contrato del policy profile de deuda](validation-debt-policy-profile-contract.md)
- [Catálogo de fixtures SDBP v1](validation-debt-policy-fixture-catalog.md)
- [Catálogo de fixtures del validador SDD/ADR](sdd-validator-fixture-catalog.md)
- [Contrato de integración CI del validador SDD](sdd-validation-ci-integration-contract.md)
- [Catálogo de fixtures SDDCI v1](sdd-validation-ci-fixture-catalog.md)
- [Contrato del registro](registry-contract.md)
- [Contrato del registro ADR](adr-registry-contract.md)
- [Contrato de autoría/readiness de ADRs](adr-authoring-readiness-contract.md)
- [Catálogo de fixtures ADRT v1](adr-authoring-fixture-catalog.md)
- [Protocolo de revisión de contratos](contract-review-checklist.md)
- [Contrato de evidencia de implementación](implementation-evidence-contract.md)
- [Contrato de retiro de rutas legacy](legacy-path-retirement-contract.md)
- [Migración de README placeholders](placeholder-readme-migration.md)
- [Contrato de dependencias de plataforma](platform-dependency-contract.md)
- [Auditoría final de especificación](final-specification-audit.md)
- [Auditoría de cierre de definición normativa](specification-definition-gap-audit.md)
- [Auditoría de consistencia semántica](semantic-consistency-audit.md)
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
