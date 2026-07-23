# Manifiesto de migración — README placeholder

## Alcance y custodia

Se detectan 136 README no versionados con formato legado:

```text
055–065, 071–080, 087–097, 102–144, 146–206
```

Como no están en Git, su origen/autor no puede inferirse. Este manifiesto define el contenido
propuesto, pero no autoriza sobrescribirlos. Antes del reemplazo se registra path + hash y decisión
`KEEP_AND_MIGRATE | REPLACE_WITH_TEMPLATE | DISCARD_BY_OWNER`.

## Mapping por rango

| Rango | Dominio | Fase | Tipos derivados del slug |
| --- | --- | --- | --- |
| 055–065 | Floor | 2 | api, event, rbac |
| 071–080 | Reservations | 2 | api, event, calculation, rbac |
| 087–097 | Ordering | 2 | api, event, rbac |
| 102–110 | Kitchen | 2 | api, event, rbac, workflow |
| 111–123 | Workforce | 2 | entity, api, event, calculation, rbac, rules |
| 124–136 | Cash | 2 | entity, api, event, calculation, rbac, rules |
| 137–156 | Fiscal | 3 | entity, api, event, calculation, rules |
| 157–171 | Feedback | 3 | entity, api, event, integration, rbac |
| 172–186 | Integrations | 3 | entity, api, connector, event, rbac |
| 187–206 | AnalyticsAI | 3 | entity, api, ai, event, rbac |

Los gaps 066–070, 081–086, 098–101 y 145 poseen README versionados/no placeholder y no entran en
este lote.

## Inferencia permitida

- ID: prefijo numérico del directorio.
- Título: heading/slug revisado.
- Tipo: prefijo del slug según allowlist; `ai` se conserva como tipo especializado o se mapea a
  `Capability` sólo mediante decisión de schema.
- Dominio/fase: tabla anterior.
- Estado: `DRAFT` para placeholder sin aprobación.
- Readiness: `BLOCKED`.
- Review target: `PROPOSED_FOR_REVIEW`.
- Owner/Reviewer: `UNASSIGNED`.
- Blocker común: `PLAT-REV-001` + finding de metadata del bloque.

No se infieren Prioridad, approval, implementation evidence ni estado superior. Prioridad queda
`UNASSIGNED` hasta decisión humana, no `TBD`.

## Template canónico

```markdown
# [SPEC-NNN] Título

Resumen de una oración tomado del objetivo/contrato, sin afirmar implementación.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-NNN |
| **Tipo** | TYPE |
| **Dominio** | DOMAIN |
| **Estado** | DRAFT |
| **Readiness** | BLOCKED |
| **Review target** | PROPOSED_FOR_REVIEW |
| **Prioridad** | UNASSIGNED |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Fase** | PHASE |
| **Depende de** | IDs serializados y revisados |
| **Blockers** | finding IDs concretos |

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Contrato](contract.md)
- [Verificación](verification.md)
- [Estructura](structure.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
```

Links ausentes se omiten y generan `SDD004`; no se crean archivos vacíos para satisfacer navegación.

## Dependencias

Las dependencias no se deducen del orden numérico. Se toman de los contratos de autoridad y reviews
por bloque; cada referencia debe existir y el grafo completo debe ser acíclico. Consumers posteriores
no se agregan como prerequisites inversos.

## Procedimiento por lote

1. Capturar hash/origen de README local.
2. Resolver custodia con su owner.
3. Generar propuesta en diff sin stage.
4. Revisar resumen, type/domain/fase/dependencies/blockers.
5. Ejecutar links/metadata/DAG validator.
6. Agregar a Git sólo después de aprobación del lote.
7. Registrar commit/reviewer/outcome sin promover readiness automáticamente.
