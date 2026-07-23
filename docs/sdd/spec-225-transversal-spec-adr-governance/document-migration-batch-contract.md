# Contrato de lotes de migración documental — SPEC-225

## Propósito

La normalización de 226 specs no se realiza como reemplazo global. Cada lote debe preservar
semántica, ownership, historia y posibilidad de review/rollback.

## Identidad y lifecycle

Formato:

```text
SDD-MIG-NNN
```

Estados:

```text
PLANNED | BASELINED | IN_PROGRESS | IN_REVIEW | ACCEPTED | REJECTED | SUPERSEDED
```

- `PLANNED`: scope y responsables propuestos.
- `BASELINED`: paths, hashes, commit y conteos iniciales congelados.
- `IN_PROGRESS`: mapping/ediciones en curso.
- `IN_REVIEW`: diff completo contra baseline, sin ampliar scope.
- `ACCEPTED`: reviewer aprobó outcome y commit exacto.
- `REJECTED`: hallazgos impiden incorporar.
- `SUPERSEDED`: otro lote identificado lo reemplaza.

## Manifest

```yaml
batchId: SDD-MIG-NNN
scope:
  specs: [SPEC-NNN]
  artifacts: [objective, specification, rules, structure, verification, plan, tasks, README, contract]
baselineCommit: <sha completo>
paths:
  tracked: [<paths>]
  untracked: [<path, hash, provenance status>]
objectives: [<tipos de deuda a resolver>]
outOfScope: [<cambios excluidos>]
owner: <asignación ACCEPTED o UNASSIGNED>
reviewers: [<asignaciones>]
beforeMetrics: {}
afterMetrics: {}
mappings: [<refs>]
findings: [<IDs>]
outcome: PENDING | ACCEPTED | REJECTED
reviewedCommit: <sha o null>
```

## Reglas de scope

- Un lote agrupa specs con autoridad/reviewer y semántica relacionadas.
- No mezcla implementación productiva.
- No incorpora archivos no versionados sin procedencia/decisión.
- No cambia estado, readiness, prioridad u ownership salvo que ése sea objetivo explícito con
  autoridad.
- No resuelve findings externos ejecutando defaults.
- Si aparece una decisión nueva, se registra y revisa; no se esconde como “normalización”.

## Baseline

Antes de editar:

1. registrar commit y worktree relevante;
2. separar tracked, modified, deleted y untracked;
3. hashear archivos locales no versionados;
4. capturar métricas reproducibles;
5. identificar cambios concurrentes;
6. congelar scope/out-of-scope.

Un lote no puede afirmar reducción de deuda contra un baseline regenerado después de editar.
El manifest y las transiciones del snapshot se rigen por
`worktree-baseline-snapshot-contract.md`.

## Mapping obligatorio

Toda transformación semántica conserva mapping:

- texto legacy → IDs canónicos;
- alias → ID canónico;
- item compuesto → split de nodos;
- duplicado → autoridad elegida;
- exclusión → clasificación/razón;
- checkbox histórico → evidencia o finding;
- estimación legacy → verificada, vencida o `LEGACY_UNVERIFIED`.

Cambios puramente editoriales pueden agruparse, pero se declaran como tales.

El formato común, hashing, clasificación y orden se rigen por
`migration-mapping-schema-contract.md`.

## Ratchet

Cada lote reporta antes/después al menos:

- IDs/nodos creados por tipo;
- huérfanos y referencias rotas;
- placeholders/tokens inválidos;
- metadata ausente/no canónica;
- links rotos;
- blockers/targets/dependencies sin evaluar;
- checks históricos sin evidencia;
- archivos no versionados afectados.

Un lote `ACCEPTED` no aumenta deuda fuera de su scope. Una excepción requiere finding, owner y
vencimiento.

## Review

El reviewer verifica:

- mapping completo y reversible conceptualmente;
- ausencia de semántica inventada;
- preservación de aliases/historia;
- links e identidad;
- coherencia catálogo–README;
- métricas before/after;
- conflictos y archivos locales respetados;
- que ningún checkbox/lifecycle se promovió sin evidencia.

Review se registra sobre el commit exacto. Un cambio posterior vuelve stale el outcome para paths
afectados.
El record usa `document-review-evidence-contract.md`.

## Rollback

Rollback revierte el lote documental completo o aplica una corrección revisada. No se usa reset
destructivo sobre trabajo concurrente.

Los IDs publicados no se reutilizan aunque se revierta el texto; quedan retirados/superseded con
historia.

## Orden de migración propuesto

El orden reduce riesgo documental y no representa prioridad de producto:

1. piloto de gobernanza SPEC-225 para validar IDs/mappings;
2. SPEC-001–036 `IN_PROGRESS`, con revisión retroactiva y commits candidatos;
3. README raíz versionados restantes por bloque;
4. SPEC-207–226, refinando `DOCUMENT_SKELETON`;
5. 136 README no versionados sólo después de resolver ownership/procedencia;
6. reconciliación global de edges, catálogo e índices.

Cada paso puede subdividirse por dominio y reviewer.

## Línea base consolidada

Deudas conocidas que requieren lotes:

- 226 objectives, specifications, structures, verifications, plans y tasks sin IDs canónicos;
- 223 rules sin IDs propios y 43 aliases legacy a preservar;
- 226 contracts `UNVERSIONED_LEGACY`;
- 136 README locales no versionados;
- 36 specs `IN_PROGRESS` sin manifests retroactivos;
- 71 review targets y 70 dependencias sin evaluar;
- 40 blockers genéricos;
- 25 checks históricos de tareas sin evidencia;
- 20 estructuras transversales `DOCUMENT_SKELETON`.

## Criterios de salida por lote

- [ ] Baseline/manifest completos.
- [ ] Scope sin ampliación silenciosa.
- [ ] Mappings revisables.
- [ ] Métricas mejoran o excepción explícita.
- [ ] Cero cambios productivos.
- [ ] Outcome sobre commit exacto.

Los checks se evalúan por lote; este contrato no los marca.
