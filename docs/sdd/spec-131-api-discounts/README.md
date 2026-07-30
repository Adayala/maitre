# [SPEC-131] Discounts API

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-131 |
| **Tipo** | API |
| **Dominio** | Cash |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Prioridad** | UNASSIGNED |
| **Owner / Reviewer** | UNASSIGNED / UNASSIGNED |
| **Fase** | 3 |

> **Nota de alcance (I0):** la API materializada administra, publica, evalúa y
> registra `DiscountApplication` con cálculo server-side. El engine
> transaccional que revalida stacking/caps/usage y actualiza `Order` o `Check`
> permanece diferido hasta congelar `MoneyPolicy`, reglas de elegibilidad,
> concurrencia y compensación. La aplicación I0 es una traza auditable y no
> modifica automáticamente el total dependiente.

## Documentos

- [Contrato](contract.md)
- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Estructura](structure.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
