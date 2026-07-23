# Catálogo de fixtures del snapshot schema v1 — SPEC-225

## Formato

```yaml
id: SNAP-FIX-NNN
kind: POSITIVE | NEGATIVE
input: <HEAD, scope y estado simulado>
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  codes: [SNAPxxx]
```

Los hashes simbólicos se usan sólo en esta especificación; fixtures ejecutables usan SHAs reales con
longitud/formato válidos.

## Códigos

| Código | Condición |
| --- | --- |
| `SNAP001` | schemaVersion desconocida |
| `SNAP002` | ID/batch/HEAD inválido |
| `SNAP003` | scope vacío, ambiguo o fuera del workspace |
| `SNAP004` | estado Git incompatible con hashes/presencia |
| `SNAP005` | provenance/disposition incompatible |
| `SNAP006` | path duplicado/no normalizado |
| `SNAP007` | contenido/path sensible dentro del snapshot |
| `SNAP008` | symlink/tipo no soportado |
| `SNAP009` | snapshot cambió después de freeze |
| `SNAP010` | review incompleto para `FROZEN` |
| `SNAP011` | entry en scope sin inventariar |
| `SNAP012` | serialización no determinista |

## Casos positivos

### SNAP-FIX-001 — Tracked clean

HEAD contiene el path; baseline blob y bytes de worktree coinciden.

Expected: `TRACKED_CLEAN`, provenance `PREEXISTING`, disposition `PRESERVE`.

### SNAP-FIX-002 — Tracked modified preexistente

HEAD contiene el path y `worktreeSha256` difiere. El cambio existía antes del lote.

Expected: `TRACKED_MODIFIED/PREEXISTING`; puede ser `PRESERVE` o `EXCLUDE`. `EDIT_IN_BATCH` requiere
decisión explícita.

### SNAP-FIX-003 — Tracked deleted

HEAD contiene blob y el path está ausente.

Expected:

```yaml
gitState: TRACKED_DELETED
baselineBlob: <sha>
worktreeSha256: null
disposition: DELETE_PENDING_REVIEW
```

No produce outcome `RETIRED`.

### SNAP-FIX-004 — Untracked con procedencia desconocida

Path existe, no tiene baseline blob y su autor/intención no está confirmada.

Expected: `UNTRACKED/UNKNOWN`; sólo `PRESERVE` o `EXCLUDE`.

### SNAP-FIX-005 — Worktree sucio válido

Scope mezcla clean, modified, deleted y untracked, todos inventariados.

Expected: `ACCEPT` como `DRAFT`; puede congelarse sólo con provenance/disposition/review completos.

### SNAP-FIX-006 — Scope explícito

Lista de nueve paths base ordenada y dentro de SPEC-225.

Expected: expansión determinista, cero globs en snapshot congelado.

### SNAP-FIX-007 — Freeze completo

HEAD completo, entries/hashes/provenance, owner/reviewer y outcome `APPROVE`.

Expected: transición `DRAFT → FROZEN`.

### SNAP-FIX-008 — Cambio concurrente

Snapshot estaba frozen; un path cambia bytes.

Expected: `MARK_STALE [SNAP009]`; crear successor, no actualizar hashes en sitio.

## Casos negativos

### SNAP-FIX-009 — Deleted con hash de worktree

Input: `TRACKED_DELETED` y `worktreeSha256` no nulo.

Expected: `REJECT [SNAP004]`.

### SNAP-FIX-010 — Untracked con baseline blob

Expected: `REJECT [SNAP004]`.

### SNAP-FIX-011 — Unknown editado por lote

Input: provenance `UNKNOWN`, disposition `EDIT_IN_BATCH`.

Expected: `REJECT [SNAP005]`.

### SNAP-FIX-012 — Path traversal

Input: `../`, path absoluto o path que sale del workspace.

Expected: `REJECT [SNAP003]`; no resolver/leer fuera del scope.

### SNAP-FIX-013 — Path duplicado

Input contiene `a/../b.md` y `b.md`.

Expected: normalizar antes de validar y `REJECT [SNAP006]`.

### SNAP-FIX-014 — Secret path

Input incluye `.env`, private key, credential export o token file.

Expected: `REJECT [SNAP007]`; no emitir hash/valor sensible.

### SNAP-FIX-015 — Symlink no declarado

Input path es symlink tratado como archivo regular.

Expected: `REJECT [SNAP008]`.

### SNAP-FIX-016 — Entry faltante

Scope expandido contiene nueve archivos y manifest sólo ocho.

Expected: `REJECT [SNAP011]`.

### SNAP-FIX-017 — Freeze sin reviewer

Input: status `FROZEN`, reviewer `UNASSIGNED` u outcome `PENDING`.

Expected: `REJECT [SNAP010]`.

### SNAP-FIX-018 — HEAD cambiado

Snapshot frozen sobre commit A; revisión se intenta sobre commit B.

Expected: `MARK_STALE [SNAP009]`, incluso si paths conservan bytes.

### SNAP-FIX-019 — Schema desconocido

Input: `schemaVersion: 2` con reader v1.

Expected: `REJECT [SNAP001]`.

### SNAP-FIX-020 — Orden variable

Mismas entries en distinto orden.

Expected: normalización produce bytes idénticos; si no, `REJECT [SNAP012]`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| estados Git | 001–005, 009–010 |
| scope/path | 006, 012–013, 016 |
| provenance/disposition | 002–004, 011 |
| seguridad/tipos | 014–015 |
| freeze/review | 007, 017 |
| staleness/concurrencia | 008, 018 |
| schema/determinismo | 019–020 |

## Criterios de salida

- [x] Veinte casos especificados.
- [x] Doce códigos definidos.
- [x] Dirty/deleted/untracked/stale cubiertos.
- [ ] Fixtures ejecutables creadas.
- [ ] Snapshot validator implementado.
- [ ] Owner/reviewer aprueban catálogo.

Los últimos tres checks permanecen abiertos.
