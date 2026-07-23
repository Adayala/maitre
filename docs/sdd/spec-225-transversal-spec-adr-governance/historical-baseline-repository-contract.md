# Contrato del repositorio de baselines históricos — SPEC-225

## Propósito

Definir dónde y cómo se versionan los baselines `SDBL`, sin crear directorios, manifests, entries ni
aceptaciones. Complementa el
[contrato de deuda histórica](historical-validation-debt-baseline-contract.md).

## Decisión propuesta

```yaml
baselineRepository:
  decisionStatus: PROPOSED_NOT_APPROVED
  root: .sdd/baselines/validation
  format: YAML_UTF8_LF
  activePointer: active.yaml
  immutableDirectory: history
  evidenceDirectory: evidence
  schemaVersion: 1
  filesCreated: 0
```

La ruta es repository-relative, visible para revisión y separada de los documentos de producto.
No se considera activa hasta aprobarse mediante `DOC-REV`.

## Layout lógico

```text
.sdd/baselines/validation/
├── active.yaml
├── history/
│   └── SDD-BASE-NNN.yaml
└── evidence/
    └── SDD-BASE-NNN.review.yaml
```

- `active.yaml` es un pointer declarativo, no una copia del baseline.
- `history/<baselineId>.yaml` contiene el envelope normativo e inmutable.
- `evidence/<baselineId>.review.yaml` referencia la revisión, sus hashes y el commit revisado.
- No se permiten archivos temporales, backups, globs externos ni symlinks.

## Active pointer

```yaml
schemaVersion: 1
activeBaselineId: SDD-BASE-NNN
baselinePath: history/SDD-BASE-NNN.yaml
baselineSha256: sha256:<hex>
evidencePath: evidence/SDD-BASE-NNN.review.yaml
evidenceSha256: sha256:<hex>
activatedAt: <UTC RFC3339>
activationCommit: <sha completo>
```

El pointer no contiene entries, excepciones ni overrides. Si no existe baseline activa,
`active.yaml` no existe: un documento vacío, `null` o `activeBaselineId: NONE` no son equivalentes.

## Resolución segura

El consumidor:

1. parte exclusivamente del root configurado;
2. rechaza paths absolutos, `..`, encoding ambiguo y NUL;
3. resuelve sin seguir symlinks;
4. exige nombre de archivo igual al ID declarado;
5. verifica hashes antes de interpretar aceptación;
6. exige que baseline y evidence permanezcan dentro del root;
7. falla cerrado ante pointer parcial, destino ausente o formato desconocido.

La ausencia del root significa `BASELINE_NOT_CONFIGURED`; no autoriza generar uno ni degradar el
gate silenciosamente.

## Escritura y activación atómicas

Una propuesta de baseline se prepara en una rama/PR:

1. agregar nuevo archivo immutable history;
2. agregar evidence de review correspondiente;
3. validar schema, hashes, subject y ratchet;
4. actualizar `active.yaml` en el mismo cambio revisado;
5. verificar que el predecessor activo no fue modificado;
6. fusionar sólo con aprobación requerida.

El validador de CI es read-only. Ningún check, retry o job puede escribir el root. La herramienta
administrativa futura debe usar archivo temporal dentro del mismo filesystem, `fsync` cuando
aplique y rename atómico; los temporales nunca se versionan.

## Inmutabilidad e historia

- Un archivo de `history/` referenciado alguna vez por `active.yaml` no se edita ni elimina.
- Correcciones crean un successor con nuevo ID.
- `baselineId`, filename y content hash forman la identidad física.
- Un baseline `DRAFT` puede existir en una PR, pero nunca es target de `active.yaml`.
- El predecessor queda preservado aunque su status lógico sea `SUPERSEDED`.
- Git history no reemplaza el enlace explícito `supersedes`.

## Evidence

El archivo evidence contiene sólo referencias verificables:

```yaml
schemaVersion: 1
baselineId: SDD-BASE-NNN
baselineSha256: sha256:<hex>
reviewRef: <DOC-REV ID>
reviewedCommit: <sha completo>
reviewers: [<OWN refs>]
decision: APPROVED | REJECTED
decidedAt: <UTC RFC3339>
```

`APPROVED` requiere coincidencia exacta entre baseline hash, reviewed commit y activation change.
Evidence restringida se referencia por ID/hash; no se copia al repositorio público.

## Concurrencia

Dos propuestas nacidas del mismo active baseline compiten:

- ambas deben declarar el mismo predecessor esperado;
- la primera activada cambia el pointer;
- la segunda queda `STALE` y debe rebaselinar su delta;
- no se elige por timestamp, número de ID ni orden lexicográfico;
- el merge driver no combina entries automáticamente.

## Acceso y ownership

```yaml
ownership:
  policyOwner: UNASSIGNED
  baselineMaintainers: [UNASSIGNED]
  requiredReviewers: [UNASSIGNED]
  ciAccess: READ_ONLY
  runtimeAccess: NONE
```

CODEOWNERS/branch protection son mecanismos candidatos, no evidencia observada ni configurada. La
aprobación final debe asignar personas o equipos mediante refs `OWN`.

## Compatibilidad

- `schemaVersion` desconocida falla cerrado.
- Cambiar root, format, pointer schema o hashing es cambio `BREAKING`.
- Un migrador preserva baseline IDs, hashes previos y successor mappings.
- Lectura dual sólo puede habilitarse en ventana explícita y reporta cuál fuente decidió el gate.
- No hay fallback implícito a artifacts de CI, cache, variable de entorno o remote URL.

## Retención y recuperación

- Historia y evidence aprobadas: retención permanente salvo política legal superior documentada.
- Borrar accidentalmente `active.yaml`: gate falla; no selecciona “el más nuevo”.
- Corromper/missing target: gate falla; no reconstruye desde summary.
- Rollback activa un nuevo successor que restaura semántica aprobada; no apunta silenciosamente a un
  predecessor expirado.
- Disaster recovery verifica hashes y review antes de restaurar el pointer.

## Códigos

| Código | Condición |
| --- | --- |
| `SDBS001` | root/layout/path/filename inválido |
| `SDBS002` | active pointer ausente, parcial o inconsistente cuando es requerido |
| `SDBS003` | hash de baseline/evidence no coincide |
| `SDBS004` | history aprobado modificado o eliminado |
| `SDBS005` | baseline DRAFT/REJECTED/STALE activado |
| `SDBS006` | review/evidence/commit no corresponde |
| `SDBS007` | activación no atómica o predecessor inesperado |
| `SDBS008` | writer no autorizado o CI/runtime intenta escribir |
| `SDBS009` | symlink/traversal/escape o contenido sensible |
| `SDBS010` | schema/format/hash compatibility no soportada |
| `SDBS011` | fallback/cache/artifact/remote altera fuente autoritativa |
| `SDBS012` | selección, serialización o reporte no determinista |

## Estado y criterios de salida

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
canonicalRootCreated: false
activePointerCreated: false
historyFiles: 0
evidenceFiles: 0
activeBaseline: null
```

- [x] Root y layout propuestos.
- [x] Pointer, hashing, atomicidad e inmutabilidad especificados.
- [x] Concurrencia, acceso, compatibilidad y recuperación especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `SDBS`.
- [ ] Asignar ownership y aprobar root/schema/policy mediante `DOC-REV`.
- [ ] Crear estructura sólo durante bootstrap autorizado.
