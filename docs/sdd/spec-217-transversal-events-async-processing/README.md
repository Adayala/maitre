# [SPEC-217] Events & Async Processing

Contrato transversal para publicar y consumir eventos de integración sin perder hechos, duplicar efectos ni acoplar el dominio a una plataforma de mensajería.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-217 |
| **Tipo** | Transversal / Event Architecture |
| **Dominio** | Platform / Integration |
| **Estado** | DRAFT — PROPOSED FOR APPROVAL |
| **Prioridad** | P0 |
| **Fase** | Antes del primer efecto asíncrono |
| **Depende de** | SPEC-207–216 |

## Decisiones centrales

- Entrega at-least-once con consumidores idempotentes.
- Transactional outbox para cambios de estado + publicación.
- Inbox/deduplicación para efectos críticos.
- Orden garantizado sólo por agregado mediante `aggregateVersion`.
- Procesamiento corto y programado durante el MVP; workers portables cuando el volumen lo requiera.
- Eventos de integración, auditoría y event sourcing son conceptos separados.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
