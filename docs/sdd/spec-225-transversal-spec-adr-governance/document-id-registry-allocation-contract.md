# Contrato de registro y asignación de IDs documentales — SPEC-225

## Propósito

Definir la asignación única, atómica y no reutilizable de IDs `SDD-DOC-*`, junto con un registro que
permita localizar documentos activos e históricos. Este contrato no crea el registro ni reserva
números.

## Estado

```yaml
registry:
  schemaVersion: 1
  status: PROPOSED_FOR_REVIEW
  canonicalPath: NOT_CREATED
  baselineCommit: NOT_FROZEN
  allocatedIds: 0
  nextId: NOT_INITIALIZED
  owner: UNASSIGNED
  reviewers: [UNASSIGNED]
```

`nextId: NOT_INITIALIZED` evita afirmar que `00001` está disponible antes de aprobar namespace y
baseline.

## Autoridad

- El registro es autoridad para asignación, tombstones, localización y aliases históricos.
- El envelope es autoridad para metadata del documento.
- Registro y envelope deben coincidir en `documentId`, path, specRef, role y status aplicables.
- Una divergencia bloquea; ninguna fuente sobreescribe silenciosamente a la otra.
- Proyecciones/índices derivados no asignan IDs.

El path canónico del registro se decide en review. No se crea archivo placeholder.

## Namespace

```text
SDD-DOC-NNNNN
```

- cinco dígitos decimales, zero-padded;
- namespace global dentro del repositorio;
- case-sensitive;
- sin semántica de spec, rol, fecha o orden de prioridad;
- el ancho puede ampliarse sólo mediante nueva schemaVersion;
- gaps se conservan; no se rellenan.

## Entry

```yaml
document:
  documentId: SDD-DOC-NNNNN
  canonicalPath: <path relativo>
  specRef: <SPEC-NNN o null>
  role: <rol documental>
  status: RESERVED | DRAFT | ACTIVE | DEPRECATED |
    SUPERSEDED | RETIRED | TOMBSTONED
  aliases:
    - type: LEGACY_PATH | PREVIOUS_PATH | PREVIOUS_TITLE
      value: <valor>
      validFrom: <commit>
      validUntil: <commit o null>
  successorId: <SDD-DOC-NNNNN o null>
  allocatedBy: <allocationId>
  allocatedAtCommit: <sha completo>
  envelopeBlob: <git blob o null>
  reviewRefs: [<DOC-REV IDs>]
```

`RESERVED` sólo existe dentro de una transacción/propuesta; no puede quedar publicado en la rama
principal sin envelope/documento asociado.

## Allocation request

```yaml
allocation:
  allocationId: SDD-DOC-ALLOC-NNN
  status: PROPOSED | BASELINED | APPLIED | REJECTED | STALE
  baselineCommit: <sha completo>
  registryHash: sha256:<hex>
  quantity: <entero positivo>
  mappings:
    - mappingRef: <DOCM-MAP-NNN>
      targetPath: <path>
      requestedRole: <rol>
      requestedSpecRef: <SPEC-NNN o null>
  assignedIds: [<IDs o vacío>]
  owner: <assignment o UNASSIGNED>
  reviewers: [<assignments>]
  reviewedCommit: <sha o null>
  reviewRef: <DOC-REV o null>
```

Una request `PROPOSED` no contiene IDs asignados. `assignedIds` se completa durante la transacción
atómica y nunca se usa para “apartar” números fuera de un cambio revisable.

## Algoritmo de asignación

Sobre registro congelado:

1. validar schema, hash, commit y ausencia de otra allocation aplicada sobre baseline stale;
2. obtener el mayor número alguna vez asignado, incluidos tombstones;
3. tomar los siguientes `quantity` números consecutivos;
4. validar que ninguno aparece en entries, tombstones, aliases o allocations aplicadas;
5. ordenar mappings por ID de mapping, no por orden del filesystem;
6. asociar IDs determinísticamente;
7. producir propuesta de entries + envelopes + diff de registro;
8. validar colisiones/invariantes;
9. aplicar todo en un único commit revisado.

Si el registro está vacío, el primer número sólo se fija al aprobar la inicialización. No se infiere
en este contrato.

## Atomicidad

Una allocation publicada incluye en el mismo commit:

- registry entries;
- envelopes con los mismos IDs;
- paths existentes;
- mappings y allocation record;
- aliases necesarios;
- validación de unicidad;
- review/evidence requeridos por el batch.

No se permiten:

- IDs en envelope sin entry;
- entries activas sin documento;
- números publicados sólo en un comentario/issue;
- reserva parcial de un batch;
- editar `nextId` manualmente como única fuente.

## Concurrencia

Dos allocations sobre el mismo baseline no se fusionan por concatenación.

- La primera aplicada avanza el registro.
- La segunda pasa a `STALE`.
- Debe rebaselinear, recalcular IDs y regenerar envelopes/diff.
- Los IDs propuestos pero nunca publicados pueden cambiar.
- Los IDs publicados no cambian ni se reutilizan.

Un lock externo puede reducir carreras, pero la corrección depende de compare-and-swap sobre
commit/hash, no del lock.

## Movimientos y aliases

- Mover un documento conserva ID.
- `canonicalPath` cambia atómicamente con envelope/consumers.
- El path anterior se registra como `PREVIOUS_PATH`.
- Alias no es segundo documento ni redirect físico obligatorio.
- Dos IDs no pueden reclamar el mismo alias vigente.
- Un path legacy se resuelve por alias sólo si su periodo incluye el commit consultado.

Aliases `LEGACY_PATH` permiten mappings durante migración, pero un envelope `ACTIVE` debería
preferir document IDs en `authorityRefs`.

## Split y merge

### Split

- identidad legacy queda `SUPERSEDED` o `RETIRED`;
- cada documento nuevo recibe ID nuevo;
- mapping declara fragmentos y successors;
- el ID original no se asigna a uno de los hijos por conveniencia sin decisión.

### Merge

- documento combinado recibe ID nuevo por defecto;
- sources quedan `SUPERSEDED` con successor común;
- conservar un ID source requiere decisión explícita sobre continuidad de identidad y review.

## Retiro, rollback y tombstones

- `SUPERSEDED` requiere successor.
- `RETIRED` requiere decisión de retiro; puede carecer de successor.
- `TOMBSTONED` conserva número asignado aunque nunca deba resolverse a contenido activo.
- Rollback posterior a publicación no libera IDs.
- Si una transacción falla antes de commit/publicación, no hay allocation y los números no se
  consideran asignados.
- Si política externa registra la reserva antes del commit, esos números se tombstonean; no se
  reutilizan.

Nunca se borra una entry histórica para reducir el máximo.

## Consistencia y catálogo

El registro valida:

- un ID por entry;
- un canonicalPath por documento no histórico;
- un document ID por envelope;
- specRef/role/status coherentes;
- successor existente y DAG válido;
- aliases únicos por periodo;
- allocation quantity/mappings/assigned IDs consistentes;
- envelope blob correspondiente al commit;
- cero paths absolutos o sensibles.

Un catálogo derivado puede ordenar/buscar, pero se regenera desde registro + envelopes y no acepta
overrides.

## Baseline

```yaml
baselineId: DOCID-BASE-001
status: OBSERVED_NOT_FROZEN
canonicalRegistryPresent: false
canonicalEnvelopesTracked: 0
allocatedIdsObserved: 0
tombstonesObserved: 0
allocationRecordsObserved: 0
nextId: NOT_INITIALIZED
```

La ausencia observada no prueba que nunca hayan existido identificadores externos. Inicializar exige
búsqueda/review de colisiones en historia y referencias externas conocidas.

## Inicialización

Antes de la primera allocation:

1. aprobar namespace/schema/path;
2. revisar Git history y docs por IDs que coincidan;
3. decidir primer número y estrategia de import;
4. registrar tombstones/reservas históricas si aparecen;
5. congelar `DOCID-BASE-*`;
6. materializar fixtures;
7. obtener DOC-REV;
8. crear registro e inicial allocation atómicamente.

El piloto `SDD-DOCM-001` no puede inicializar unilateralmente el namespace.

## Reporte

```yaml
schemaVersion: 1
subjectCommit: <sha>
registryHash: sha256:<hex>
summary:
  entries: 0
  active: 0
  historical: 0
  tombstones: 0
  aliases: 0
  maxAllocated: <número o null>
findings: [<DIDA records>]
```

Orden numérico por ID y luego alias; sin timestamps, rutas absolutas ni orden del filesystem.

## Códigos

| Código | Condición |
| --- | --- |
| `DIDA001` | registry/schema/path/serialización inválidos |
| `DIDA002` | document ID inválido, duplicado o reutilizado |
| `DIDA003` | canonicalPath/envelope/entry ausente o divergente |
| `DIDA004` | allocation request/mapping/quantity inconsistente |
| `DIDA005` | baseline commit/hash stale o concurrencia perdida |
| `DIDA006` | asignación no determinista, gap rellenado o max incorrecto |
| `DIDA007` | alias inválido, duplicado o periodo inconsistente |
| `DIDA008` | move/split/merge sin mapping/continuidad |
| `DIDA009` | successor/retiro/tombstone inválido |
| `DIDA010` | review/assignment/atomicidad incompletos |
| `DIDA011` | path/metadata sensible o insegura |
| `DIDA012` | versión incompatible, drift o output no determinista |

## Seguridad

- Registro no contiene PII, emails personales, tokens ni credentials.
- `allocatedBy` referencia assignment/record, no identidad sensible libre.
- Paths son relativos, normalizados y dentro del repositorio.
- YAML parser seguro, sin tags/aliases ejecutables.
- CI read-only valida; no asigna IDs en pull requests concurrentes automáticamente.
- Logs redactan environment y no imprimen registry completo si contiene refs restringidas.

## Criterios de salida

- [x] Namespace, entry, allocation y autoridad especificados.
- [x] Atomicidad, concurrencia, aliases, split/merge y tombstones especificados.
- [x] Baseline sin registro/IDs declarado sin elegir primer número.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `DIDA`.
- [ ] Aprobar schema/path/primer número.
- [ ] Crear registro sólo junto con allocation revisada.
- [ ] Ejecutar allocation del piloto.

Los últimos tres checks permanecen abiertos. Los casos normativos están definidos en
`document-id-registry-fixture-catalog.md`; `nextId` continúa `NOT_INITIALIZED`.
