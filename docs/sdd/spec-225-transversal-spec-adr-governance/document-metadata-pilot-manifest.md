# SDD-DOCM-001 — Piloto de metadata de índices

## Estado

```yaml
batchId: SDD-DOCM-001
status: PLANNED
subjectCommit: NOT_FROZEN
snapshotRef: NOT_FROZEN
schemaRef: SDD_DOCUMENT_METADATA@1
schemaStatus: PROPOSED_FOR_REVIEW
owner: UNASSIGNED
reviewers: [UNASSIGNED]
documentIds: PENDING_ALLOCATION
outcome: PENDING
reviewRef: null
```

Este manifest prepara un mapping de dos documentos. No asigna IDs, no aplica envelopes y no modifica
los índices.

## Objetivo

Validar que metadata documental puede agregarse a dos índices ya navegables:

- sin alterar body, links, coverage ni outcomes;
- conservando ownership por spec;
- separando `role: GUIDE` del rol de la colección;
- usando mapping, snapshot, ratchet y review reproducibles.

El piloto prueba el procedimiento documental, no el parser/validator.

## Scope

| Mapping | Documento | Owner spec | Estado Git observado | Disposición |
| --- | --- | --- | --- | --- |
| `DOCM-MAP-001` | `docs/sdd/spec-225-transversal-spec-adr-governance/reviews/README.md` | SPEC-225 | `TRACKED_MODIFIED` | `PRESERVE_UNTIL_SNAPSHOT` |
| `DOCM-MAP-002` | `docs/sdd/spec-226-transversal-i0-platform-validation-spikes/evidence/README.md` | SPEC-226 | `TRACKED_CLEAN` | `PRESERVE_UNTIL_SNAPSHOT` |

El estado es una observación, no snapshot congelado. La procedencia del cambio en
`DOCM-MAP-001` no se infiere ni se sobrescribe.

## Fuera de scope

- los 31 hijos de ambos índices;
- agregar backlink al parent en el body;
- reclasificar informes, findings o templates;
- cambiar estados `BLOCKED`/`NOT_RUN`;
- asignar owners/reviewers/personas;
- activar schemaVersion 1;
- implementar parser, validator o CI;
- resolver `NAVD-META-001/002`;
- modificar documentos productivos/código;
- migrar los otros 2.151 Markdown tracked del baseline.

Los backlinks quedan para un lote separado porque alteran body; este piloto aísla el envelope.

## Mappings propuestos

### DOCM-MAP-001

```yaml
mapping:
  mappingId: DOCM-MAP-001
  source:
    path: docs/sdd/spec-225-transversal-spec-adr-governance/reviews/README.md
    blobOrWorktreeSha256: NOT_FROZEN
    bodySha256: NOT_FROZEN
  target:
    documentId: PENDING_ALLOCATION
    specRef: SPEC-225
    title: Registro de revisiones de contratos
    role: GUIDE
    status: DRAFT
    ownerRef: UNASSIGNED
    authorityRefs:
      - PATH:docs/sdd/spec-225-transversal-spec-adr-governance/README.md
      - PATH:docs/sdd/spec-225-transversal-spec-adr-governance/contract-review-checklist.md
    generatedFrom: []
    successorRef: null
    effectiveFrom: null
    reviewRefs: []
  bodyChange: NONE
  linkChange: NONE
  outcomeChange: NONE
  childMetadataChange: NONE
```

Los `PATH:` son refs provisionales del mapping. Antes de aplicar deben resolverse a document IDs
aprobados o a una clase de referencia temporal admitida por el schema.

Las estrategias permitidas y el registro `DREF-PILOT-001`–`004` están en
`document-reference-identity-contract.md`.

### DOCM-MAP-002

```yaml
mapping:
  mappingId: DOCM-MAP-002
  source:
    path: docs/sdd/spec-226-transversal-i0-platform-validation-spikes/evidence/README.md
    blobOrWorktreeSha256: NOT_FROZEN
    bodySha256: NOT_FROZEN
  target:
    documentId: PENDING_ALLOCATION
    specRef: SPEC-226
    title: Registro de ejecución — SPEC-226
    role: GUIDE
    status: DRAFT
    ownerRef: UNASSIGNED
    authorityRefs:
      - PATH:docs/sdd/spec-226-transversal-i0-platform-validation-spikes/README.md
      - PATH:docs/sdd/spec-226-transversal-i0-platform-validation-spikes/contract.md
    generatedFrom: []
    successorRef: null
    effectiveFrom: null
    reviewRefs: []
  bodyChange: NONE
  linkChange: NONE
  outcomeChange: NONE
  childMetadataChange: NONE
```

`GUIDE` describe el índice. Los seis `SPK-*` continúan siendo templates/records de evidence
`NOT_RUN`; este mapping no les asigna metadata.

## Condiciones de entrada

- schema DOCM v1 y catálogo de fixtures aprobados;
- owner SPEC-225 y owner SPEC-226 aceptados;
- reviewers de gobernanza/arquitectura aceptados;
- snapshot de ambos paths congelado;
- procedencia/disposición del modified file confirmada;
- allocator/registro de document IDs especificado y aprobado;
- refs `PATH:` reconciliadas;
- parser capaz de preservar body byte-for-byte definido;
- DOC-REV disponible.

Mientras falte una condición, status permanece `PLANNED`.

## Asignación de IDs

El piloto no reserva números en esta etapa.

```yaml
allocationRequest:
  namespace: SDD-DOC
  quantity: 2
  status: NOT_REQUESTED
  registryBaseline: NOT_FROZEN
  collisionCheck: NOT_RUN
  allocationReview: null
```

Los dos IDs se asignan atómicamente después de congelar el registro. Un ID provisional nunca se
publica en el documento.

El procedimiento, namespace y baseline están especificados en
`document-id-registry-allocation-contract.md`; aprobación e inicialización permanecen pendientes.

## Preservación del body

Para cada path se calculan:

```yaml
bodyPreservation:
  sourceBodySha256: <hash sin envelope>
  targetBodySha256: <hash después de retirar envelope canónico>
  expectedEqual: true
  newlinePolicy: PRESERVE_EXISTING
  encoding: UTF-8
```

El parser no reflowea Markdown, cambia headings, ordena tablas ni normaliza links. Si no puede
preservar bytes, el lote se rechaza.

El algoritmo, precondiciones, round-trip y códigos están definidos por
`document-body-preservation-contract.md`.

## Procedimiento futuro

1. aprobar schema/catalog, sin activar enforcement global;
2. congelar registro, commit y snapshot;
3. resolver provenance del path modificado;
4. revisar mappings y refs provisionales;
5. asignar dos IDs sin colisión;
6. generar propuesta de envelopes en memoria/artifact;
7. comprobar body hashes y diff limitado;
8. aplicar ambos envelopes o dividir el batch explícitamente;
9. validar DOCM/NAVD/NAVL;
10. emitir DOC-REV sobre commit exacto.

Este procedimiento está especificado, no ejecutado.

## Métricas

```yaml
before:
  scopedDocuments: 2
  canonicalEnvelopes: 0
  allocatedDocumentIds: 0
  bodyChanges: 0
  linkChanges: 0
afterRequired:
  scopedDocuments: 2
  canonicalEnvelopes: 2
  allocatedDocumentIds: 2
  bodyChanges: 0
  linkChanges: 0
  outcomeChanges: 0
  childMetadataChanges: 0
  validationFindings: 0
```

Las métricas `afterRequired` son exit criteria, no estado actual.

## Atomicidad y rollback

- Envelopes, registry entries y allocated IDs se revisan juntos.
- Si sólo un mapping puede avanzar, se crea sub-lote/successor; no se marca el batch completo.
- Rollback retira ambos envelopes/registry entries mediante cambio revisado.
- IDs publicados durante una aplicación aceptada no se reutilizan tras rollback; quedan retirados.
- No se usa reset/checkout destructivo sobre el README modificado.

## Findings esperables

| Finding | Condición |
| --- | --- |
| `DOCM-PILOT-001` | schema/catalog no aprobados |
| `DOCM-PILOT-002` | owner/reviewer sin asignar |
| `DOCM-PILOT-003` | snapshot/provenance no congelados |
| `DOCM-PILOT-004` | allocator/registry no aprobado |
| `DOCM-PILOT-005` | refs provisionales no reconciliadas |
| `DOCM-PILOT-006` | body hash cambia |
| `DOCM-PILOT-007` | diff amplía scope/outcomes |

Los primeros cinco están implícitamente abiertos por el estado actual; no se emiten records de
finding hasta existir owner/registro.

## Relación con NAVD

- El piloto no cierra `NAVD-META-001/002` porque no agrega backlinks ni owner aceptado.
- Puede completar la porción de envelope/role sólo después de ejecución aceptada.
- Coverage permanece 31/31.
- Parent→index permanece 2/2.
- `migrations/` no cambia porque este manifest vive en la raíz de SPEC-225.

## Criterios de salida

- [x] Scope de dos documentos y exclusiones especificados.
- [x] Mappings propuestos sin IDs ficticios.
- [x] Preservación de body, métricas y rollback especificados.
- [ ] Aprobar schema/catalog.
- [ ] Asignar owner/reviewers.
- [ ] Congelar snapshot/registry y resolver provenance.
- [ ] Asignar IDs y reconciliar refs.
- [ ] Aplicar envelopes con body hashes iguales.
- [ ] Validar y emitir DOC-REV.

Los últimos seis checks permanecen abiertos. Estado: `PLANNED`; aplicación: `NOT_STARTED`.
