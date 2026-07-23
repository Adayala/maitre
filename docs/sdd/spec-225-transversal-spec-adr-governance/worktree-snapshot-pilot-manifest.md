# SDD-SNAP-001 — Snapshot propuesto para SDD-MIG-001

## Estado

```yaml
schemaVersion: 1
snapshotId: SDD-SNAP-001
batchId: SDD-MIG-001
status: DRAFT
repository:
  headCommit: NOT_FROZEN
  branch: main
scopeStatus: EXPLICIT_NOT_FROZEN
hashStatus: NOT_CAPTURED
provenanceStatus: INCOMPLETE
owner: UNASSIGNED
reviewer: UNASSIGNED
reviewOutcome: PENDING
supersedes: null
```

Este manifest define el snapshot futuro; no captura hashes, no congela HEAD y no concede ownership.

## Objetivo

Congelar los nueve artefactos base de SPEC-225 antes de ejecutar `SDD-MIG-001`, preservando cambios
preexistentes y evitando atribuir al batch un archivo untracked sin provenance confirmada.

## Scope explícito

```yaml
include:
  - docs/sdd/spec-225-transversal-spec-adr-governance/README.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/contract.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/objective.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/plan.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/rules.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/specification.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/structure.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/tasks.md
  - docs/sdd/spec-225-transversal-spec-adr-governance/verification.md
exclude: []
```

El scope es closed-world: todo path no enumerado queda fuera. El snapshot congelado serializa paths
explícitos, no globs ni expresiones `except`.

## Observación de estados

Corte previo al freeze:

| Path | Git state observado | Provenance propuesta | Disposición actual | Gate |
| --- | --- | --- | --- | --- |
| `README.md` | `TRACKED_MODIFIED` | `PREEXISTING` | `PRESERVE` | reconciliar mapping antes de editar |
| `contract.md` | `TRACKED_CLEAN` | `PREEXISTING` | `PRESERVE` | mapping/review |
| `objective.md` | `TRACKED_CLEAN` | `PREEXISTING` | `PRESERVE` | mapping/review |
| `plan.md` | `TRACKED_CLEAN` | `PREEXISTING` | `PRESERVE` | mapping/review |
| `rules.md` | `TRACKED_CLEAN` | `PREEXISTING` | `PRESERVE` | mapping/review |
| `specification.md` | `TRACKED_MODIFIED` | `PREEXISTING` | `PRESERVE` | reconciliar mapping antes de editar |
| `structure.md` | `UNTRACKED` | `UNKNOWN` | `PRESERVE` | ownership/provenance obligatorio |
| `tasks.md` | `TRACKED_MODIFIED` | `PREEXISTING` | `PRESERVE` | reconciliar mapping antes de editar |
| `verification.md` | `TRACKED_CLEAN` | `PREEXISTING` | `PRESERVE` | mapping/review |

`PREEXISTING` significa anterior al futuro inicio del batch, no que se conozca autor/intención de
cada cambio. Los estados deben recalcularse durante baseline.

## Entries pendientes

Cada path deberá materializar:

```yaml
entry:
  path: <path explícito>
  gitState: <recalculado>
  baselineBlob: NOT_CAPTURED
  worktreeSha256: NOT_CAPTURED
  sizeBytes: NOT_CAPTURED
  provenance: PREEXISTING | UNKNOWN
  disposition: PRESERVE
```

Ninguna entry usa todavía `EDIT_IN_BATCH`. Esa disposición sólo se propone después de aprobar
mapping y, para `structure.md`, resolver provenance.

## Bloqueo de `structure.md`

El archivo:

- existe en el worktree;
- no posee blob baseline en Git;
- es requerido por el scope lógico de nueve artifacts;
- no tiene ownership/provenance congelada.

Alternativas:

```text
INCLUDE_AS_PREEXISTING | EXCLUDE_FROM_BATCH | INCORPORATE_VIA_REVIEW |
REPLACE_WITH_REVIEWED_SUCCESSOR | BLOCKED
```

- No se borra ni agrega a Git para cerrar el snapshot.
- `INCLUDE_AS_PREEXISTING` requiere confirmar procedencia y preservar hash.
- `EXCLUDE_FROM_BATCH` cambia exit criteria de structure y requiere finding.
- `INCORPORATE_VIA_REVIEW` no convierte contenido en diseño aprobado.
- `REPLACE_WITH_REVIEWED_SUCCESSOR` conserva mapping/historia.

Estado actual: `BLOCKED`.

## Paths modificados

Para `README.md`, `specification.md` y `tasks.md`:

- el snapshot debe hashear bytes del worktree, además del blob de HEAD;
- mapping parte de esos bytes, no restaura versión HEAD;
- cambios concurrentes posteriores vuelven snapshot stale;
- no se separan “cambios del batch” por heurística de diff;
- provenance/intención se revisa antes de `EDIT_IN_BATCH`.

## Mappings y artifacts auxiliares

Los mappings de SDD-MIG-001 no entran automáticamente en este snapshot.

Antes de freeze se elige:

1. snapshot sólo de sources + manifest de mappings con hashes propios; o
2. ampliar scope explícitamente con paths de mapping ya aprobados.

Crear nuevos archivos auxiliares después del freeze requiere successor/enmienda revisada; no se
agregan silenciosamente.

## Seguridad

El scope contiene sólo Markdown bajo SPEC-225. Aun así, antes de hashear:

- ejecutar secret/path classifier;
- no incluir contenido completo en manifest;
- rechazar symlinks/tipos inesperados;
- usar paths relativos;
- no copiar diffs en evidence si exponen datos sensibles.

Un finding sensible se registra redactado, no se resuelve publicando su hash.

## Freeze checklist

- [ ] Schema SNAP v1 y catálogo aprobados.
- [ ] Owner/reviewer aceptados.
- [ ] HEAD completo y branch confirmados.
- [ ] Nueve paths reenumerados sin drift.
- [ ] Blob/worktree hashes y sizes capturados.
- [ ] Provenance de tres modified revisada.
- [ ] Provenance/disposición de `structure.md` resuelta.
- [ ] Disposición final por path aprobada.
- [ ] Secret/type checks pasan.
- [ ] DOC-REV del snapshot emitido.

Ningún check está satisfecho sólo por este manifest DRAFT.

## Transiciones

```text
DRAFT → FROZEN → STALE
  └→ REJECTED_DRAFT
STALE → SUPERSEDED_BY SDD-SNAP-NNN
```

`REJECTED_DRAFT` es outcome del proceso, no status persistido del schema; un draft rechazado no se
publica como snapshot frozen.

## Staleness

Después de freeze, cualquier cambio en:

- HEAD/branch;
- los nueve paths, estados, hashes o sizes;
- scope/exclusions;
- provenance/disposition;
- schema/policy;
- batch/mapping relevante;

crea `STALE`. No se actualizan hashes dentro de `SDD-SNAP-001`; se crea successor.

## Relación con SDD-DOCM-001

El piloto de metadata usa otros dos paths, uno compartido indirectamente con esta área de trabajo
(`reviews/README.md`) pero fuera del scope de SDD-MIG-001. No se agrega a `SDD-SNAP-001`.

Si ambos batches se ejecutan concurrentemente:

- cada uno conserva snapshot propio;
- un cambio en SPEC-225 root README puede afectar navegación pero no habilita editar reviews README;
- findings/dependencias se enlazan, snapshots no se fusionan.

## Métricas esperadas

```yaml
currentObservation:
  scopedPaths: 9
  trackedClean: 5
  trackedModified: 3
  untracked: 1
  trackedDeleted: 0
  ignoredInScope: 0
  frozenHashes: 0
  editInBatch: 0
afterFreezeRequired:
  scopedPaths: 9
  inventoriedEntries: 9
  frozenHashes: 9
  unknownProvenance: 0
  unreviewedDisposition: 0
  reviewOutcome: APPROVE
```

`frozenHashes: 9` significa una representación válida por entry; un deleted futuro usaría
`worktreeSha256: null` según contrato y cambiaría estas expectativas.

## Criterios de salida

- [x] Scope de nueve paths expandido.
- [x] Estados Git actuales observados.
- [x] Riesgos de modified/untracked y alternativas especificados.
- [x] Freeze/staleness/concurrencia especificados.
- [ ] Aprobar schema/catalog y assignees.
- [ ] Resolver provenance/disposición.
- [ ] Capturar hashes y congelar.
- [ ] Emitir DOC-REV.

Los últimos cuatro checks permanecen abiertos. `status=DRAFT`, `frozenHashes=0`.
