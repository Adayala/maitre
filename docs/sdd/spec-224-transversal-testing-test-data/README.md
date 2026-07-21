# [SPEC-224] Testing & Test Data Strategy

Contrato transversal para obtener evidencia confiable con tests rápidos, mantenibles, aislados y cercanos al riesgo real.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-224 |
| **Tipo** | Transversal / Quality Engineering |
| **Dominio** | Engineering / Verification |
| **Estado** | DRAFT |
| **Readiness** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Fase** | Antes del primer código funcional |
| **Depende de** | SPEC-207, SPEC-209–223 |

## Decisiones centrales

- Unit tests para dominio/aplicación sin red, DB o reloj global.
- PostgreSQL real para repositorios, migraciones, transacciones y RLS.
- Fastify `inject()` para rutas; MSW para el boundary HTTP del frontend.
- OpenAPI/schemas como contratos sin mantener tipos duplicados.
- Pocos E2E críticos con Playwright y datos aislados.
- Builders/fixtures sintéticos, deterministas y multi-tenant por defecto.
- Un flaky test es un defecto; cuarentena sólo temporal y gobernada.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)

La ejecución CI y sus comandos pertenecen a la [matriz de SPEC-207](../spec-207-transversal-engineering-quality/quality-gates.md); esta spec define qué evidencia producen los tests.
