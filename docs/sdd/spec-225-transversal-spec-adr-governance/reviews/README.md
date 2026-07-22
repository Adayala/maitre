# Registro de revisiones de contratos

Este directorio conserva la primera revisión por pares documental de SPEC-001–226 según el
[protocolo de SPEC-225](../contract-review-checklist.md). Cada informe es la fuente detallada de
sus findings; este índice sólo ordena la navegación y no reemplaza metadata/readiness de cada
spec.

## Cobertura

| Dominio | Specs | Informe | Outcome |
| --- | --- | --- | --- |
| Organization | 001–016 | [Informe](organization-spec-001-016.md) | BLOCKED |
| Identity | 017–026 | [Informe](identity-spec-017-026.md) | BLOCKED |
| Subscription | 027–036 | [Informe](subscription-spec-027-036.md) | BLOCKED |
| Catalog | 037–043 | [Informe](catalog-spec-037-043.md) | BLOCKED |
| Audit/Dashboard | 044–048 | [Informe](audit-dashboard-spec-044-048.md) | BLOCKED |
| Floor Core | 049–054 | [Informe](floor-core-spec-049-054.md) | BLOCKED |
| Floor APIs/Events | 055–065 | [Informe](floor-api-events-spec-055-065.md) | BLOCKED |
| Reservations Core | 066–070 | [Informe](reservations-core-spec-066-070.md) | BLOCKED |
| Reservations APIs/Events | 071–080 | [Informe](reservations-api-events-spec-071-080.md) | BLOCKED |
| Ordering Core | 081–086 | [Informe](ordering-core-spec-081-086.md) | BLOCKED |
| Ordering APIs/Events | 087–097 | [Informe](ordering-api-events-spec-087-097.md) | BLOCKED |
| Kitchen | 098–110 | [Informe](kitchen-spec-098-110.md) | BLOCKED |
| Workforce | 111–123 | [Informe](workforce-spec-111-123.md) | BLOCKED |
| Cash Management | 124–136 | [Informe](cash-spec-124-136.md) | BLOCKED |
| Fiscal/ARCA | 137–156 | [Informe](fiscal-arca-spec-137-156.md) | BLOCKED |
| Feedback/Reputation | 157–171 | [Informe](feedback-reputation-spec-157-171.md) | BLOCKED |
| Integrations | 172–186 | [Informe](integrations-spec-172-186.md) | BLOCKED |
| Analytics/AI | 187–206 | [Informe](analytics-ai-spec-187-206.md) | BLOCKED |
| Platform/Governance | 207–226 | [Informe](platform-transversal-spec-207-226.md) | BLOCKED |

Cobertura: 19 informes, 226 specs, ningún `APPROVE`. Esto no significa que todos los contratos
tengan igual riesgo: muchos criterios positivos están documentados, pero al menos un finding
bloqueante impide aprobar cada bloque.

Las decisiones normativas que pueden cerrarse sin inventar evidencia externa están consolidadas
en [Especificaciones faltantes](../../MISSING_SPECIFICATIONS.md). Ese documento no promueve
readiness: owners, revisiones expertas, ADRs, spikes y mediciones continúan bloqueados hasta contar
con evidencia real.

## Orden de resolución

1. Gobernanza: owners/reviewers, enum de readiness, DAG de dependencias y revisión retroactiva
   de commits `feat`.
2. Plataforma I0: ejecutar spikes, aceptar/rechazar ADR-002/003/004 y demostrar quality gates,
   free-tier budgets, secrets, restore y exit strategy.
3. Autoridades de dominio: resolver identidades/ledgers/state machines que condicionan APIs y
   eventos (capacity, Order/Kitchen, CashSession, FiscalPointOfSale, employment y data registry).
4. Contratos cross-domain: dinero/impuestos, roles/permisos, PII/consentimiento, events y
   offline/realtime.
5. Providers y capacidades no esenciales: conectores, reputación externa, ML/LLM y Autopilot,
   sólo después de spikes de costo/viabilidad y con fallback.

El detalle accionable y las dependencias iniciales se mantienen en
[findings-register.md](findings-register.md). La secuencia de cierre está definida en el
[plan de remediación](remediation-plan.md). Gate R0 mantiene una
[auditoría retroactiva de implementación](implementation-drift-audit.md) y una
[propuesta de DAG acíclico](dependency-dag-remediation.md). La migración de estados se define en
[normalización lifecycle/readiness](lifecycle-readiness-remediation.md), y los responsables en la
[matriz de ownership/review](ownership-review-matrix.md).
