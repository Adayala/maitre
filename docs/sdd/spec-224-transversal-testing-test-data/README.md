# [SPEC-224] Testing & Test Data Strategy

Contrato transversal para obtener evidencia confiable con tests rápidos, mantenibles, aislados y cercanos al riesgo real.

| Campo                | Valor                             |
| -------------------- | --------------------------------- |
| **ID**               | SPEC-224                          |
| **Tipo**             | Transversal                       |
| **Subtype**          | Quality Engineering               |
| **Dominio**          | Engineering / Verification        |
| **Estado**           | DRAFT                             |
| **Readiness**        | BLOCKED                           |
| **Review target**    | READY_FOR_I0_REVIEW               |
| **Prioridad**        | P0                                |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED           |
| **Blockers**         | Asignar owner y reviewer          |
| **Fase**             | Antes del primer código funcional |
| **Depende de**       | SPEC-207, SPEC-209–223            |

## Decisiones centrales

- Unit tests para dominio/aplicación sin red, DB o reloj global.
- PostgreSQL real para repositorios, migraciones, transacciones y RLS.
- Fastify `inject()` para rutas; MSW para el boundary HTTP del frontend.
- OpenAPI/schemas como contratos sin mantener tipos duplicados.
- Pocos E2E críticos con Playwright y datos aislados.
- Builders/fixtures sintéticos, deterministas y multi-tenant por defecto.
- Un flaky test es un defecto; cuarentena sólo temporal y gobernada.

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
- [Harness y cobertura E2E vigentes](../../foundation/20-e2e-flow-coverage.md)
- [Historial: journey MVP E2E autoritativo](implementation-history/add-authoritative-mvp-e2e-journey/proposal.md)

La ejecución CI y sus comandos pertenecen a la [matriz de SPEC-207](../spec-207-transversal-engineering-quality/quality-gates.md); esta spec define qué evidencia producen los tests.

## Estado implementado del harness

La topología, los comandos, los perfiles efímero/persistente, la evidencia vigente y el backlog se
mantienen exclusivamente en
[Cobertura E2E de flujos entre aplicaciones](../../foundation/20-e2e-flow-coverage.md). Esta spec
conserva el contrato normativo general de testing y datos; no duplica el inventario operativo.
