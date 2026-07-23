# Contrato de snapshot baseline del worktree — SPEC-225

## Propósito

Un lote documental necesita comparar before/after sin perder cambios locales ni atribuirse trabajo
concurrente. El snapshot registra estado y hashes; no modifica Git ni concede ownership.

## Identidad

Formato:

```text
SDD-SNAP-NNN
```

Un snapshot pertenece a un único `SDD-MIG-NNN` y es inmutable una vez `FROZEN`.

## Schema lógico

```yaml
schemaVersion: 1
snapshotId: SDD-SNAP-NNN
batchId: SDD-MIG-NNN
repository:
  headCommit: <sha completo>
  branch: <nombre o DETACHED>
scope:
  include: [<paths explícitos>]
  exclude: [<paths explícitos>]
entries:
  - path: <ruta relativa normalizada>
    gitState: TRACKED_CLEAN | TRACKED_MODIFIED | TRACKED_DELETED | UNTRACKED | IGNORED_IN_SCOPE
    baselineBlob: <git blob sha o null>
    worktreeSha256: <sha256 o null>
    sizeBytes: <entero o null>
    provenance: OWNED_BY_BATCH | PREEXISTING | UNKNOWN
    disposition: PRESERVE | EDIT_IN_BATCH | DELETE_PENDING_REVIEW | EXCLUDE
status: DRAFT | FROZEN | STALE | SUPERSEDED
review:
  owner: <asignación o UNASSIGNED>
  reviewer: <asignación o UNASSIGNED>
  outcome: PENDING | APPROVE | REQUEST_CHANGES
```

## Clasificación

- `TRACKED_CLEAN`: bytes coinciden con HEAD/index.
- `TRACKED_MODIFIED`: path rastreado con worktree diferente.
- `TRACKED_DELETED`: path rastreado ausente.
- `UNTRACKED`: presente sin entrada versionada.
- `IGNORED_IN_SCOPE`: ignorado pero dentro del scope; se registra sin contenido sensible.

El snapshot no llama “nuevo” a un untracked ni “retirado” a un deleted: describe observación, no
intención.

## Scope

Paths se enumeran explícitamente. No se usan globs ambiguos como autoridad del snapshot congelado.
Directorios se expanden a archivos y se ordenan lexicográficamente.

Para SDD-MIG-001 el scope propuesto comprende los nueve artefactos base de SPEC-225 y mappings que
sean aprobados. Documentos auxiliares sólo ingresan mediante enmienda del manifest antes de freeze.

La expansión concreta y los estados observados están en `worktree-snapshot-pilot-manifest.md`.

## Hashes

- `headCommit`: SHA Git completo.
- `baselineBlob`: blob de HEAD para tracked paths.
- `worktreeSha256`: SHA-256 de bytes actuales.
- un deleted usa `worktreeSha256: null`;
- directories/symlinks requieren tipo explícito antes de admitirlos;
- contenido sensible no se incorpora para “completar” un hash publicado.

El snapshot manifest no incluye contenido de archivos; sólo metadata/hashes.

## Provenance y disposición

`provenance`:

- `OWNED_BY_BATCH`: creado expresamente dentro del lote después de baseline mediante enmienda
  revisada;
- `PREEXISTING`: existía antes del lote;
- `UNKNOWN`: no se conoce autor/intención.

`UNKNOWN` no puede usar `EDIT_IN_BATCH` ni `DELETE_PENDING_REVIEW` hasta resolver ownership.

`disposition` no ejecuta la acción. `DELETE_PENDING_REVIEW` registra una eliminación observada o
propuesta, siempre pendiente de aprobación.

## Freeze

Un snapshot pasa a `FROZEN` cuando:

1. scope/exclusiones están cerrados;
2. HEAD/branch fueron registrados;
3. todas las entries poseen estado/hash;
4. provenance/disposition están revisados;
5. owner/reviewer aceptaron;
6. cero secret-like path/value fue incluido;
7. el manifest se vincula al batch.

Freeze no requiere worktree limpio.

## Staleness

Antes de aplicar/revisar el lote se recalculan:

- HEAD;
- presencia/estado de paths;
- worktree hashes;
- scope.

Cualquier diferencia vuelve el snapshot `STALE`. No se actualiza en sitio: se crea otro snapshot que
supersede al anterior y se reevalúan mappings afectados.

## Cambios concurrentes

Si un path cambia después de freeze:

- se detiene su transformación;
- se identifica si el cambio pertenece al lote o es concurrente;
- se crea snapshot successor;
- se revalida mapping/hash;
- no se restaura, sobreescribe ni descarta automáticamente.

## Seguridad

Se excluyen:

- secrets/credentials/tokens;
- `.env*` con valores;
- dumps, PII y payloads fiscales crudos;
- artifacts binarios no necesarios;
- paths fuera del workspace autorizado.

Puede registrarse la existencia de un path sensible con clasificación redactada sólo si el gate lo
requiere, sin hash que facilite correlación indebida.

## Snapshot del piloto

SDD-MIG-001 permanece:

```yaml
baselineCommit: NOT_FROZEN
worktreeSnapshot: NOT_FROZEN
```

El checkout contiene modificaciones y archivos no versionados relevantes; eso no impide definir el
snapshot, pero exige provenance/disposition antes de congelarlo.

## Criterios de salida

- [ ] Schema aprobado.
- [x] Scope explícito expandido en manifest DRAFT.
- [ ] Estados/hashes reproducibles.
- [ ] Provenance/disposition revisados.
- [ ] Cero contenido sensible.
- [ ] Snapshot enlazado a SDD-MIG-001.

Los checks de aprobación, hashes, provenance, freeze y review permanecen abiertos; no se tomó
snapshot.

Los escenarios positivos/negativos y códigos esperados están definidos en
`worktree-snapshot-fixture-catalog.md`.
