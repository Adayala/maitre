# Registro de validación de fragments Markdown — SPEC-225

## Propósito

Inventariar cada fragment local actualmente detectado y conservar su estado hasta que exista un
renderer profile aprobado. Este registro no valida anchors por semejanza textual.

## Estados

```text
DISCOVERED | PENDING_PROFILE | READY_FOR_EVALUATION |
RESOLVED | NOT_FOUND | AMBIGUOUS | STALE | RETIRED
```

- `DISCOVERED`: link extraído, todavía no reconciliado con archivo/heading.
- `PENDING_PROFILE`: archivo y heading candidato existen; falta semántica de renderer.
- `READY_FOR_EVALUATION`: profile activo y evidencia de input congelada.
- `RESOLVED`: el profile generó exactamente el fragment enlazado.
- `NOT_FOUND`: ningún heading generó el ID.
- `AMBIGUOUS`: el profile no permite resolución inequívoca.
- `STALE`: source, target, heading o profile cambió después del outcome.
- `RETIRED`: el link fue retirado con decisión/evidencia.

`PENDING_PROFILE` no es pass, warning aceptado ni baseline de deuda.

## Registro actual

Todos los destinos resuelven al archivo
`spec-210-transversal-data-identity-platform/i0-physical-dictionary.md`.

| ID | Source | Línea | Fragment | Heading candidato | Línea target | Estado |
| --- | --- | ---: | --- | --- | ---: | --- |
| `FRAG-001` | `spec-001-entity-tenant/structure.md` | 4 | `maitretenants--spec-001` | `` `maitre.tenants` — SPEC-001 `` | 41 | `PENDING_PROFILE` |
| `FRAG-002` | `spec-002-entity-brand/structure.md` | 4 | `maitrebrands--spec-002` | `` `maitre.brands` — SPEC-002 `` | 58 | `PENDING_PROFILE` |
| `FRAG-003` | `spec-003-entity-fiscal-entity/structure.md` | 5 | `maitrefiscal_entities--spec-003` | `` `maitre.fiscal_entities` — SPEC-003 `` | 78 | `PENDING_PROFILE` |
| `FRAG-004` | `spec-004-entity-branch/structure.md` | 4 | `maitrebranches--spec-004` | `` `maitre.branches` — SPEC-004 `` | 96 | `PENDING_PROFILE` |
| `FRAG-005` | `spec-005-entity-salon/structure.md` | 4 | `maitresalons--spec-005` | `` `maitre.salons` — SPEC-005 `` | 120 | `PENDING_PROFILE` |
| `FRAG-006` | `spec-006-entity-table/structure.md` | 6 | `maitredining_tables--spec-006` | `` `maitre.dining_tables` — SPEC-006 `` | 134 | `PENDING_PROFILE` |
| `FRAG-007` | `spec-017-entity-user/structure.md` | 4 | `maitreusers--spec-017` | `` `maitre.users` — SPEC-017 `` | 155 | `PENDING_PROFILE` |
| `FRAG-008` | `spec-018-entity-role/structure.md` | 4 | `maitreroles--spec-018` | `` `maitre.roles` — SPEC-018 `` | 174 | `PENDING_PROFILE` |
| `FRAG-009` | `spec-019-entity-permission/structure.md` | 4 | `maitrepermissions--spec-019` | `` `maitre.permissions` — SPEC-019 `` | 188 | `PENDING_PROFILE` |
| `FRAG-010` | `spec-020-entity-membership/structure.md` | 4 | `maitrememberships--spec-020` | `` `maitre.memberships` — SPEC-020 `` | 215 | `PENDING_PROFILE` |

Conteo:

```yaml
fragments: 10
sources: 10
targets: 1
headingCandidates: 10
pendingProfile: 10
resolved: 0
notFound: 0
ambiguous: 0
```

## Evidencia observada

Para las diez filas:

- el source contiene un link Markdown inline;
- la ruta relativa normalizada apunta al target declarado;
- el target existe en el worktree observado;
- existe un único heading candidato por texto/entidad referida;
- el fragment parece derivado de ese heading, pero esa semejanza no prueba el algoritmo;
- no existe profile activo ni conformance output.

Las líneas son ayudas de review y pueden cambiar. La identidad usa ID, source, raw target y heading
candidate hash, no sólo número de línea.

## Record de evaluación

```yaml
fragmentEvaluation:
  fragmentId: FRAG-NNN
  subjectCommit: <sha completo>
  source:
    path: <path>
    line: <entero>
    rawTarget: <texto>
    textSha256: <hash>
  target:
    path: <path>
    fileSha256: <hash>
    headingText: <texto exacto>
    headingPath: [<ancestros>]
    headingTextSha256: <hash>
  rendererProfile: <profileId@revision>
  generatedHeadingId: <string o null>
  outcome: RESOLVED | NOT_FOUND | AMBIGUOUS
  evidenceRef: <conformance report>
  reviewRef: <DOC-REV>
```

No se permite `RESOLVED` sin `generatedHeadingId`, profile activo y hashes coincidentes.

## Gate de transición

### `PENDING_PROFILE → READY_FOR_EVALUATION`

Requiere:

- consumer primario aprobado;
- renderer profile `ACTIVE`;
- source/target incluidos en snapshot de commit;
- conformance fixtures aprobadas.

### `READY_FOR_EVALUATION → RESOLVED`

Requiere:

- raw fragment igual al ID generado;
- resultado reproducible offline;
- evidencia sobre commit/profile exactos;
- DOC-REV.

### Resultado fallido

`NOT_FOUND` o `AMBIGUOUS` abre decisión:

```text
CHANGE_LINK | CHANGE_HEADING | ADD_EXPLICIT_ID | CHANGE_PROFILE | ACCEPT_TEMPORARY_FINDING
```

La decisión debe evaluar consumidores; no se reescribe masivamente ni se baselinea de forma
automática.

## Drift

Un record `RESOLVED` pasa a `STALE` si cambia:

- raw target o fragment;
- source/target file hash relevante;
- heading text/path;
- renderer/profile revision;
- estrategia multi-renderer.

Mover líneas sin cambiar texto/hash no lo vuelve stale. Agregar un heading anterior sí puede afectar
IDs duplicados y exige reevaluación si el profile numera por orden.

## Relación con NAVL

- `PENDING_PROFILE` produce estado de configuración pendiente y no oculta `NAVL006`.
- `NOT_FOUND`/`AMBIGUOUS` se reportan `NAVL006`.
- target file ausente se reporta `NAVL001` y la fila pasa a `STALE`.
- un fragment retirado no elimina su historia: queda `RETIRED` con mapping/review.
- el gate no debe emitir 10 findings duplicados si el blocker común es profile ausente; reporta el
  blocker de configuración y conserva las diez filas afectadas.

## Criterios de salida

- [x] Diez fragments inventariados individualmente.
- [x] Source, target y heading candidato reconciliados.
- [x] Estados, evidence schema, transiciones y drift especificados.
- [ ] Congelar hashes sobre subject commit.
- [ ] Activar renderer profile.
- [ ] Evaluar cada fragment.
- [ ] Resolver outcomes fallidos.
- [ ] Registrar DOC-REV.

Los últimos cinco checks permanecen abiertos; `resolved` continúa en cero.
