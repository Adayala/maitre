# [SPEC-210] Data & Identity Platform

Decisión de PostgreSQL, identidad y almacenamiento inicial para el MVP de costo cero.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-210 |
| **Tipo** | Transversal |
| **Subtype** | Architecture Decision |
| **Dominio** | Platform / Identity / Data |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Blockers** | Adopción pendiente de ADR-002 y SPK-02–06; asignar owner y reviewer |
| **Prioridad** | P0 |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Fase** | Antes del walking skeleton con persistencia |
| **Depende de** | ADR-002, SPEC-207–209, SPEC-214, SPEC-220, SPEC-226 |

## Decisión propuesta

Evaluar **Supabase Free** como proveedor inicial de PostgreSQL y Auth. Storage sólo se habilita cuando una spec funcional lo requiera. La adopción depende de ADR-002 y evidencia PASS de SPEC-226; los puertos propios y la salida a PostgreSQL/identidad reemplazable son obligatorios.

## Documentos

- [Objetivo y comparación](objective.md)
- [Diseño](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Riesgos y fuentes](notes.md)
