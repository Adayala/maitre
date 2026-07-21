# [SPEC-215] HTTP API Standards

Contrato transversal para APIs HTTP consistentes, seguras, observables y evolutivas.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-215 |
| **Tipo** | Transversal / API Architecture |
| **Dominio** | Platform / Contracts |
| **Estado** | DRAFT — PROPOSED FOR APPROVAL |
| **Prioridad** | P0 |
| **Fase** | Antes del primer endpoint funcional |
| **Depende de** | SPEC-016, SPEC-023, SPEC-207, SPEC-209, SPEC-211, SPEC-213 |

## Decisiones centrales

- JSON sobre HTTPS y semántica HTTP estándar.
- Paths públicos bajo `/v1`.
- OpenAPI generado desde schemas Zod ejecutables.
- Errores `application/problem+json` compatibles con RFC 9457.
- Contexto de tenant/sucursal siempre validado contra autorización.
- Idempotencia obligatoria para comandos críticos o reintentables.
- Paginación por cursor como default para colecciones mutables.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y fuentes](notes.md)
