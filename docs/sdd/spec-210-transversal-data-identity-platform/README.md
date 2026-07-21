# [SPEC-210] Data & Identity Platform

Decisión de PostgreSQL, identidad y almacenamiento inicial para el MVP de costo cero.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-210 |
| **Tipo** | Transversal / Architecture Decision |
| **Dominio** | Platform / Identity / Data |
| **Estado** | DRAFT — PROPOSED FOR APPROVAL |
| **Prioridad** | P0 |
| **Fase** | Antes del walking skeleton con persistencia |
| **Depende de** | SPEC-207, SPEC-208, SPEC-209 |

## Decisión propuesta

Usar **Supabase Free** como proveedor inicial de PostgreSQL, Auth y Storage durante desarrollo y demo del MVP, encapsulado detrás de puertos propios y con salida probada hacia PostgreSQL estándar y un proveedor de identidad reemplazable.

## Documentos

- [Objetivo y comparación](objective.md)
- [Diseño](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Riesgos y fuentes](notes.md)
