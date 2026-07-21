# [SPEC-218] Offline Operation & Synchronization

Contrato transversal para degradación, captura local y sincronización segura de las aplicaciones de Maitre ante conectividad inestable.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-218 |
| **Tipo** | Transversal / Offline Architecture |
| **Dominio** | Platform / Operations |
| **Estado** | DRAFT |
| **Readiness** | PROPOSED_FOR_REVIEW |
| **Prioridad** | P0 para Floor/Kitchen; P1 para Guest |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Fase** | Antes del piloto operativo |
| **Depende de** | SPEC-207–217 y specs funcionales de cada comando |

## Decisiones centrales

- Offline es una capacidad explícita por comando, no una propiedad global de la app.
- IndexedDB detrás de `LocalStorePort`; no se usa `localStorage` para datos operativos.
- Command journal durable con `clientMutationId` e idempotencia server-side.
- Pull incremental mediante cursor y versión; push en batches acotados con resultado por comando.
- Resolución de conflictos por regla de dominio; nunca last-write-wins universal.
- Pagos, caja, facturación/ARCA, permisos y configuración sensible permanecen online-only en el MVP.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
