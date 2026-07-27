# [SPEC-145] ARCA Integration API

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-145 |
| **Tipo** | API |
| **Dominio** | Fiscal |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 (adapter SIMULADO, no apto para emisión real) |
| **Prioridad** | P0 |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Fase** | 4 |

> **Nota de alcance (I0):** ADAPTER SIMULADO. `SimulatedArcaAdapter`
> (`packages/modules/fiscal/src/adapters/simulated-arca-adapter.ts`) genera un
> CAE falso localmente al emitir — no hay integración real con WSAA/WSFEv1, sin
> certificados, sin llamadas de red. Está detrás de un puerto (`ArcaAdapterPort`)
> para poder swapearlo por un adapter real después. **No debe usarse jamás para
> emitir comprobantes fiscales reales.**

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
