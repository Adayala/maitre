# [SPEC-001] Tenant Entity

Entidad organizacional que compra Maitre y es el límite principal de aislamiento de datos.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-001 |
| **Título** | Tenant Entity |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Status** | DRAFT |
| **Prioridad** | P0 (Crítica) |
| **Fase** | 1 (Plataforma Fundacional) |
| **Owner** | @faguero |
| **Estimación** | 8h (1d) |
| **Created** | 2026-07-20 |
| **Last updated** | 2026-07-20 |

## Overview

Una persona o empresa compra Maitre (tenant), que luego puede tener múltiples marcas, entidades fiscales y sucursales dentro del mismo contrato.

Un tenant es el **límite principal de aislamiento de datos** — todos los datos operacionales de un tenant se aislan completamente de otros tenants.

## Documentos en esta spec

| Documento | Descripción |
| --- | --- |
| [objective.md](objective.md) | Propósito, resultado esperado, criterios de aceptación |
| [specification.md](specification.md) | Schema JSON, campos, validaciones, reglas |
| [structure.md](structure.md) | Esquema detallado, enums, convenciones |
| [rules.md](rules.md) | Invariantes, reglas de negocio, transiciones de estado |
| [plan.md](plan.md) | Cómo se implementa, componentes, dependencias |
| [tasks.md](tasks.md) | Pasos concretos: fases, subtasks, estimaciones |
| [verification.md](verification.md) | Criterios de terminación, test plan, validación |
| [notes.md](notes.md) | Asunciones, riesgos, decisiones, referencias |

## Related Specs

**Dependencias (deben estar DONE primero):**
- Ninguna (SPEC-001 es foundational)

**Dependientes (dependen de ésta):**
- [SPEC-002] Brand Entity
- [SPEC-003] FiscalEntity Entity
- [SPEC-004] Branch Entity
- [SPEC-013] spec-api-tenants
- [SPEC-014] spec-event-tenant-created
- [SPEC-060] spec-rbac-organization

## Quick Links

- [Objetivo](objective.md) — Propósito y criterios de aceptación
- [Especificación](specification.md) — Schema y reglas
- [Plan](plan.md) — Cómo se implementa
- [Tasks](tasks.md) — Pasos concretos
- [Verificación](verification.md) — Cómo se prueba
- [Notas](notes.md) — Decisiones y riesgos

## Status tracking

- [ ] objective.md completado
- [ ] specification.md completado
- [ ] structure.md completado
- [ ] rules.md completado
- [ ] plan.md completado
- [ ] tasks.md completado
- [ ] verification.md completado
- [ ] notes.md completado
- [ ] Peer review completado
- [ ] Status: READY_FOR_IMPLEMENTATION

## Última actualización

**2026-07-20** — Creación de spec, skeleton completo.
- Archivos: README, objective, specification, structure, rules
- Status: DRAFT
- Next: Completar plan, tasks, verification, notes
