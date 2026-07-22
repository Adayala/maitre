# [SPEC-002] Brand Entity

Identidad comercial de un restaurante. Permite agrupar sucursales bajo una marca, compartiendo configuración, menú y políticas.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-002 |
| **Título** | Brand Entity |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Estado** | IN_PROGRESS |
| **Readiness** | WALKING_SKELETON_I0 |
| **Prioridad** | P0 |
| **Fase** | 1 (Plataforma Fundacional) |
| **Owner** | @faguero |
| **Reviewer** | UNASSIGNED |
| **Estimación** | 6h |
| **Created** | 2026-07-20 |
| **Last updated** | 2026-07-20 |

## Overview

Una marca es una identidad comercial gastronómica bajo un tenant. Un tenant puede tener múltiples marcas (ej: "La Parrilla", "Pizzería Bella", etc).

Cada marca:
- Comparte un catálogo base (heritable por sucursales)
- Tiene configuración global (tono de voz, políticas de devolución, etc)
- Agrupa sucursales relacionadas
- Puede heredar a sus sucursales configuración que éstas pueden sobrescribir

## Related Specs

**Dependencias (deben estar DONE primero):**
- [SPEC-001] Tenant Entity ✅

**Dependientes (dependen de ésta):**
- [SPEC-003] FiscalEntity Entity
- [SPEC-004] Branch Entity
- [SPEC-037] Menu Entity
- [SPEC-008] Brands API
- [SPEC-014] BrandCreated Event

## Documentos en esta spec

| Documento | Status |
| --- | --- |
| README.md | ✅ |
| objective.md | ✅ |
| specification.md | ✅ |
| structure.md | ✅ |
| rules.md | ✅ |
| plan.md | ✅ |
| tasks.md | ✅ |
| verification.md | ✅ |
| notes.md | ✅ |

## Status tracking

- [x] objective.md completado
- [x] specification.md completado
- [x] structure.md completado
- [x] rules.md completado
- [x] plan.md completado
- [x] tasks.md completado
- [x] verification.md completado
- [x] notes.md completado
- [ ] Peer review completado
- [ ] Status: READY_FOR_IMPLEMENTATION

**Current status: DRAFT (100% docs complete, awaiting peer review)**

## Quick Links

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Plan](plan.md)
- [Tasks](tasks.md)
- [Verificación](verification.md)
- [Notas](notes.md)

## Contrato especializado

- [Contrato](contract.md)
