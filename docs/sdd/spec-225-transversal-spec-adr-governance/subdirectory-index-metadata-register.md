# Registro de metadata de índices de subdirectorios — SPEC-225

## Propósito

Proponer metadata lógica para los dos índices requeridos existentes y registrar gaps sin editar sus
README. Esta clasificación no asigna personas, aprueba outcomes ni cambia lifecycle.

## Estado

```yaml
registerStatus: PROPOSED
subjectCommit: NOT_FROZEN
owner: UNASSIGNED
reviewers: [UNASSIGNED]
applicationStatus: NOT_APPLIED
reviewRef: null
```

## Índices

### DIR-IDX-001 — Reviews de SPEC-225

```yaml
directoryIndex:
  indexId: DIR-IDX-001
  directory: docs/sdd/spec-225-transversal-spec-adr-governance/reviews
  indexPath: docs/sdd/spec-225-transversal-spec-adr-governance/reviews/README.md
  indexRole: GUIDE
  collectionRoles: [AUDIT, EVIDENCE, MIGRATION]
  proposedStatus: DRAFT
  owner: UNASSIGNED
  parentEntrypoint: docs/sdd/spec-225-transversal-spec-adr-governance/README.md
  coverageMode: DIRECT_CHILDREN
  markdownChildrenExcludingIndex: 25
  linkedChildren: 25
  exclusions: []
  parentLinksIndex: true
  indexIdentifiesParentEntrypoint: false
  metadataApplied: false
```

Clasificación propuesta:

- 19 informes por dominio: `AUDIT`;
- `implementation-drift-audit.md`: `AUDIT`;
- `findings-register.md`: `EVIDENCE`;
- `dependency-dag-remediation.md`, `lifecycle-readiness-remediation.md`,
  `ownership-review-matrix.md` y `remediation-plan.md`: `MIGRATION`.

Las categorías requieren review por artifact antes de aplicarse. En particular, un plan de
remediación no se vuelve autoritativo sólo por estar indexado.

### DIR-IDX-002 — Evidence de SPEC-226

```yaml
directoryIndex:
  indexId: DIR-IDX-002
  directory: docs/sdd/spec-226-transversal-i0-platform-validation-spikes/evidence
  indexPath: docs/sdd/spec-226-transversal-i0-platform-validation-spikes/evidence/README.md
  indexRole: GUIDE
  collectionRoles: [EVIDENCE]
  proposedStatus: DRAFT
  owner: UNASSIGNED
  parentEntrypoint: docs/sdd/spec-226-transversal-i0-platform-validation-spikes/README.md
  coverageMode: DIRECT_CHILDREN
  markdownChildrenExcludingIndex: 6
  linkedChildren: 6
  exclusions: []
  parentLinksIndex: true
  indexIdentifiesParentEntrypoint: false
  metadataApplied: false
```

`SPK-01.md`–`SPK-06.md` son templates/records de evidence con estado inicial `NOT_RUN`. El rol
`EVIDENCE` describe su función; una plantilla vacía no demuestra ejecución y no permite `PASS`.

## Directorio bajo umbral

```yaml
directoryObservation:
  directory: docs/sdd/spec-225-transversal-spec-adr-governance/migrations
  markdownChildren: 1
  child: sdd-mig-001-spec-225-pilot.md
  indexRequired: false
  parentLinksChildDirectly: true
  classification: BELOW_THRESHOLD
  nextArtifactGate: CREATE_INDEX_ATOMICALLY
```

No se propone metadata de índice para un archivo inexistente.

## Findings

| Finding | Index | Código | Estado | Gap |
| --- | --- | --- | --- | --- |
| `NAVD-META-001` | `DIR-IDX-001` | `NAVD006` | `OWNERSHIP_BLOCKED` | metadata lógica no aplicada y parent entrypoint no identificado explícitamente desde el índice |
| `NAVD-META-002` | `DIR-IDX-002` | `NAVD006` | `OWNERSHIP_BLOCKED` | metadata lógica no aplicada y parent entrypoint no identificado explícitamente desde el índice |

No son findings `NAVD001/002`: los índices existen y cubren 31/31 hijos.

## Estados de remediación

```text
OWNERSHIP_BLOCKED | READY_FOR_MAPPING | IN_REVIEW | APPLIED | VERIFIED
```

- `OWNERSHIP_BLOCKED`: owner/reviewer no asignados.
- `READY_FOR_MAPPING`: assignees aceptados y snapshot congelado.
- `IN_REVIEW`: existe propuesta sobre commit exacto.
- `APPLIED`: metadata/backlink escritos, todavía sin verificación final.
- `VERIFIED`: scanner y DOC-REV confirman schema, cobertura y links.

No se salta de `OWNERSHIP_BLOCKED` a `VERIFIED`.

## Mapping de aplicación

Cada índice requiere un mapping:

```yaml
indexMetadataMapping:
  indexId: DIR-IDX-NNN
  sourceCommit: <sha completo>
  indexPath: <path>
  proposedFields:
    indexRole: <rol>
    collectionRoles: [<roles>]
    status: <status>
    owner: <assignment>
    parentEntrypoint: <path>
    coverageMode: DIRECT_CHILDREN
    exclusions: []
  contentChanges: NONE
  outcomeChanges: NONE
  childRoleChanges: NONE
  reviewRef: <DOC-REV>
```

Agregar metadata no autoriza reescribir informes, marcar spikes ni cambiar findings.

## Condiciones de aplicación

- owner/reviewer aceptados;
- snapshot de ambos README congelado;
- roles de los 31 hijos revisados;
- schema de ubicación/serialización aprobado;
- parent backlinks resolubles;
- cero cambios de contenido/outcome;
- DOC-REV sobre mapping y commit.

El cambio puede dividirse por índice; resolver uno no cierra el otro.

## Ratchet

```yaml
before:
  requiredIndexes: 2
  indexesWithAppliedMetadata: 0
  missingParentIdentity: 2
  unlinkedChildren: 0
afterRequired:
  requiredIndexes: 2
  indexesWithAppliedMetadata: 2
  missingParentIdentity: 0
  unlinkedChildren: 0
  outcomeChanges: 0
```

El ratchet no permite sacrificar cobertura para completar metadata.

## Criterios de salida

- [x] Metadata propuesta para ambos índices.
- [x] Roles de índice y colección separados.
- [x] Dos findings identificados sin confundirlos con orphans.
- [x] Mapping, transición y ratchet especificados.
- [ ] Asignar owner/reviewers.
- [ ] Congelar snapshot y revisar roles hijos.
- [ ] Aplicar metadata/backlinks.
- [ ] Validar y emitir DOC-REV.

Los últimos cuatro checks permanecen abiertos; `applicationStatus` sigue `NOT_APPLIED`.
