# [SPEC-223] Realtime State Distribution

Contrato transversal para mantener Floor, Kitchen, Cash y Dash actualizados sin confundir mensajes efímeros con estado autoritativo.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-223 |
| **Tipo** | Transversal / Realtime Architecture |
| **Dominio** | Platform / Operations |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | PROPOSED_FOR_REVIEW |
| **Prioridad** | P0 para Floor/Kitchen |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | Antes de SPEC-222 I3 |
| **Depende de** | SPEC-207–218, SPEC-222 |

## Decisiones centrales

- Estado autoritativo se consulta por APIs; una notificación sólo indica que puede haber cambios.
- MVP Demo usa polling condicional y adaptativo con cursor/ETag.
- Transporte push futuro queda detrás de `RealtimeTransportPort`.
- Supabase Realtime, si se adopta, usa canales privados y no expone cambios crudos de tablas operativas.
- Pérdida, duplicación o desorden de mensajes converge mediante refetch/sync.
- Background tabs, offline y cuotas reducen actividad de manera explícita.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y fuentes](notes.md)
