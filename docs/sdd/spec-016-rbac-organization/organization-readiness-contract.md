# Contrato de dependencias y readiness — Organization

Este documento normaliza el bloque sin inventar aprobación humana ni ocultar implementación ya
existente.

## Dependencias autoritativas

| Spec | Depende de |
| --- | --- |
| SPEC-001 Tenant | SPEC-207, SPEC-210, ADR-002 |
| SPEC-002 Brand | SPEC-001 |
| SPEC-003 FiscalEntity | SPEC-001, SPEC-219 |
| SPEC-004 Branch | SPEC-001, SPEC-002; FiscalEntity es referencia opcional |
| SPEC-005 Salon | SPEC-004 |
| SPEC-006 Table | SPEC-005 |
| SPEC-007 Tenants API | SPEC-001, SPEC-016, SPEC-215 |
| SPEC-008 Brands API | SPEC-002, SPEC-016, SPEC-215 |
| SPEC-009 FiscalEntities API | SPEC-003, SPEC-016, SPEC-215, SPEC-219 |
| SPEC-010 Branches API | SPEC-004, SPEC-016, SPEC-215 |
| SPEC-011 Salons API | SPEC-005, SPEC-016, SPEC-215 |
| SPEC-012 Tables API | SPEC-006, SPEC-016, SPEC-215 |
| SPEC-013 TenantCreated | SPEC-001, SPEC-007, SPEC-217 |
| SPEC-014 BrandCreated | SPEC-002, SPEC-008, SPEC-217 |
| SPEC-015 BranchCreated | SPEC-004, SPEC-010, SPEC-217 |
| SPEC-016 Organization RBAC | SPEC-018, SPEC-019, SPEC-020, SPEC-219 |

La relación expresa contrato previo, no consumer posterior. No hay edges API/evento→entidad en
sentido inverso ni dependencia de Organization hacia adapters concretos.

## Normalización propuesta

Para SPEC-001–015 con código existente:

```text
Estado: IN_PROGRESS
Readiness: BLOCKED
Review target: READY_FOR_I0_REVIEW
Blockers: ORG-REV-001/003, PLAT-REV-003 y ADR/gates aplicables
```

`WALKING_SKELETON_I0` se conserva como fase/target, nunca como readiness. SPEC-016 permanece
`PLANNED/BLOCKED` o `NOT_ASSESSED` hasta completar su matriz y revisión. Esta propuesta no modifica
README automáticamente: la migración requiere schema/baseline de SPEC-225 y reviewer.

## Navegación mínima

Cada README debe enlazar `objective.md`, `specification.md`, `rules.md`, `contract.md`,
`verification.md`, `structure.md`, `plan.md` y `tasks.md` cuando existan. Un link no implica que el
artefacto esté aprobado. El validador debe detectar archivos ausentes y links rotos.

## Gate de revisión retroactiva

Por spec se registra commit implementado, criterios cubiertos/no cubiertos, tests, divergencias,
owner, reviewer y outcome. La existencia de código conserva `IN_PROGRESS` pero no autoriza nuevos
cambios. Sólo review APPROVE sobre el mismo commit de spec permite evaluar
`READY_FOR_IMPLEMENTATION`; nunca se infiere por tests o checkboxes.
