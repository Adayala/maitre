# [SPEC-214] Environments, Configuration & Secrets

Contrato para configurar y desplegar Maitre de forma reproducible, segura y portable entre local, CI, Vercel, Supabase y futuras plataformas.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-214 |
| **Tipo** | Transversal / Platform Security |
| **Dominio** | Platform / Operations |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | READY_FOR_I0_REVIEW |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Asignar owner y reviewer |
| **Fase** | Antes del primer despliegue compartido |
| **Depende de** | SPEC-207–211, SPEC-213 |

## Decisión central

La configuración se define mediante schemas tipados y nombres portables. Cada plataforma inyecta valores en runtime o build sin convertirse en la fuente lógica del contrato.

Los secretos nunca se incluyen en Git, bundles web, previews no autorizadas, logs ni artefactos.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
- [Inventario de configuración](configuration-inventory.md)
