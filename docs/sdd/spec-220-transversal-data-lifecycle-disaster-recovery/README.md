# [SPEC-220] Data Lifecycle, Backup & Disaster Recovery

Contrato transversal para conservar, exportar, restaurar y eliminar datos de Maitre de manera verificable y portable.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-220 |
| **Tipo** | Transversal / Data Reliability |
| **Dominio** | Data / Operations / Privacy |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Blockers** | Gate de datos no regenerables no aprobado; asignar owner y reviewer |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Fase** | Antes de almacenar datos no regenerables |
| **Depende de** | SPEC-207, SPEC-208, SPEC-210, SPEC-214, SPEC-216, SPEC-219 |

## Decisiones centrales

- Backup no existe hasta que un restore probado demuestra recuperabilidad.
- PostgreSQL, objetos, identidad, configuración y secretos se recuperan por procedimientos coordinados pero separados.
- Exports son cifrados, inventariados y almacenados fuera del proveedor origen.
- Retención y borrado se definen por categoría de datos y obligación, no mediante una duración global.
- Demo/free tier usa datos sintéticos y objetivos modestos; producción exige una decisión de plataforma y continuidad separada.

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones](notes.md)
- [Perfil de recuperación I0](i0-recovery-profile.md)

I0 conserva sólo datos sintéticos regenerables. No existe todavía un destino durable aprobado para backups; SPK-06 prueba portabilidad con un dump temporal cifrado y cleanup obligatorio.
