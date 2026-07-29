# [SPEC-207] Engineering Quality & SDD Gates

Contrato transversal de calidad para todo cambio de Maitre.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-207 |
| **Tipo** | Transversal |
| **Dominio** | Platform / Engineering |
| **Estado** | ACTIVE |
| **Readiness** | IMPLEMENTED |
| **Review target** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Owner / Reviewer** | `@Adayala` / `@fabianaguero` |
| **Blockers** | La protección de `main` requiere permisos admin del repositorio |
| **Fase** | Todas, antes del primer código productivo |

## Propósito

Hacer verificable que cada implementación parte de una spec aprobada, conserva buen diseño y supera controles automáticos de estilo, tipos, tests, seguridad y mantenibilidad.

## Documentos

- [Contrato](contract.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y excepciones](notes.md)
- [Matriz de quality gates](quality-gates.md)
- [Hardening implementado y operación](engineering-hardening.md)
