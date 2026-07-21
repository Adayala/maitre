# [SPEC-226] I0 Platform Validation Spikes

Contrato para validar empíricamente Supabase y el toolchain React/Node antes de convertir ADR-002/003 en decisiones aceptadas.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-226 |
| **Tipo** | Transversal / Technical Spike |
| **Dominio** | Platform / Engineering |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner/reviewer y disponer de proyectos development Vercel/Supabase |
| **Prioridad** | P0 |
| **Fase** | Antes de I0 READY_FOR_IMPLEMENTATION |
| **Depende de** | ADR-001–003, SPEC-207–225 |

## Spikes

| ID | Pregunta |
| --- | --- |
| SPK-01 | ¿Fastify/Vite funcionan en Vercel y fuera de Vercel con el mismo núcleo? |
| SPK-02 | ¿Node serverless conecta de forma estable a Supabase PostgreSQL/Supavisor? |
| SPK-03 | ¿Supabase Auth se traduce a User/Membership sin confiar en claims de autorización? |
| SPK-04 | ¿Drizzle + SQL versionado reproducen schema, grants y RLS? |
| SPK-05 | ¿El toolchain completo cumple CI/Sonar/tests dentro del presupuesto gratuito? |
| SPK-06 | ¿Dump/restore/export permiten una salida verificable? |

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y evidencia](notes.md)
- [Registro de ejecución](evidence/README.md)
