# Contrato de referencias documentales tipadas — SPEC-225

## Propósito

Definir referencias estables entre metadata documental, specs, ADRs, commits y artifacts. Un path
es localizador mutable; no es identidad persistente.

Este contrato no reconcilia las refs del piloto ni asigna IDs a dependencias.

## Principios

- Toda referencia persistida declara tipo e identidad.
- `SDD-DOC-*`, `SPEC-*` y `ADR-*` no se intercambian.
- Un path puede ayudar a resolver legacy, pero no sustituye identidad en metadata activa.
- Una referencia puede seguir al objeto vigente o fijar una revisión; la intención es explícita.
- El resolver es offline y no inventa targets por similitud.

## Schema común

```yaml
reference:
  refType: DOCUMENT | SPEC | ADR | COMMIT | ARTIFACT
  refId: <identidad canónica>
  relation: GOVERNED_BY | DERIVED_FROM | EVIDENCES |
    REVIEWS | SUPERSEDES | IMPLEMENTS | NAVIGATES_TO
  resolutionMode: ACTIVE_REVISION | PINNED_COMMIT | PINNED_ARTIFACT
  revisionRef: <commit/hash/revisión o null>
  expectedStatus: <status o null>
```

Reglas:

- `ACTIVE_REVISION` exige `revisionRef: null`.
- `PINNED_COMMIT` exige SHA completo.
- `PINNED_ARTIFACT` exige ID + hash durable.
- `expectedStatus` detecta drift, no fuerza transición.
- `NAVIGATES_TO` no otorga autoridad.

## Aplicación a metadata

### `authorityRefs`

Admite:

```text
DOCUMENT | SPEC | ADR
relation = GOVERNED_BY
resolutionMode = ACTIVE_REVISION | PINNED_COMMIT
```

Una `SPEC` puede gobernar el guide/index completo cuando no se necesita autoridad más granular. Un
documento especializado requiere `DOCUMENT`.

### `generatedFrom`

Admite:

```text
DOCUMENT | COMMIT | ARTIFACT
relation = DERIVED_FROM
resolutionMode = PINNED_COMMIT | PINNED_ARTIFACT
```

Un derived document no usa `ACTIVE_REVISION` para inputs si eso impide reproducir output histórico.

### `successorRef`

Usa exclusivamente `DOCUMENT` + `SUPERSEDES`/relación inversa registrada. Specs/ADRs conservan sus
propios successors en sus registros.

### `reviewRefs`

Se mantienen como IDs `DOC-REV-*`; su schema ya fija commit/paths/hashes. No se convierten en
authorityRefs.

## Identidades válidas

| Tipo | Forma | Resolver |
| --- | --- | --- |
| `DOCUMENT` | `SDD-DOC-NNNNN` | document registry DIDA |
| `SPEC` | `SPEC-NNN` | spec registry |
| `ADR` | `ADR-NNN` | ADR registry |
| `COMMIT` | SHA Git completo | object database/checkout autorizado |
| `ARTIFACT` | ID durable + sha256 | evidence/artifact registry aplicable |

Una URL, título o filename no constituye `refId`.

## Refs legacy de mapping

Durante mapping se admite:

```yaml
legacyReference:
  type: LEGACY_PATH
  path: <path relativo>
  blobOrSha256: <hash>
  observedAtCommit: <sha completo>
  proposedResolution:
    strategy: ALLOCATE_DOCUMENT_ID | COLLAPSE_TO_SPEC_AUTHORITY |
      REMOVE_NON_AUTHORITY_REF | BLOCKED
    targetRef: <reference canónica o null>
  rationale: <texto>
  reviewRef: <DOC-REV o null>
```

`LEGACY_PATH`:

- sólo existe en mapping/migration evidence;
- requiere commit + blob/hash;
- nunca se serializa dentro de envelope `ACTIVE`;
- no se resuelve por basename/heading aproximado;
- queda `BLOCKED` si target/autoridad no es inequívoco.

## Estrategias de reconciliación

### `ALLOCATE_DOCUMENT_ID`

Se usa cuando el documento referenciado tiene identidad/autoridad propia. Requiere incluirlo en un
batch DIDA o usar ID ya registrado.

### `COLLAPSE_TO_SPEC_AUTHORITY`

Se usa cuando la owner spec completa es la autoridad suficiente y el path sólo era navegación.
Requiere demostrar que no se pierde una obligación exclusiva.

### `REMOVE_NON_AUTHORITY_REF`

Se usa cuando el link es guía/navegación, no autoridad. El link puede permanecer en body; se retira
sólo de `authorityRefs`.

### `BLOCKED`

Se usa ante ambigüedad, documento eliminado, múltiples targets o ownership sin resolver.

La estrategia no se decide automáticamente por ubicación bajo una spec.

## Línea base del piloto

`SDD-DOCM-001` contiene cuatro refs provisionales:

| Ref | Mapping | Path | Estado |
| --- | --- | --- | --- |
| `DREF-PILOT-001` | `DOCM-MAP-001` | SPEC-225 `README.md` | `UNRESOLVED_LEGACY_PATH` |
| `DREF-PILOT-002` | `DOCM-MAP-001` | `contract-review-checklist.md` | `UNRESOLVED_LEGACY_PATH` |
| `DREF-PILOT-003` | `DOCM-MAP-002` | SPEC-226 `README.md` | `UNRESOLVED_LEGACY_PATH` |
| `DREF-PILOT-004` | `DOCM-MAP-002` | SPEC-226 `contract.md` | `UNRESOLVED_LEGACY_PATH` |

```yaml
baselineId: DREF-BASE-001
status: OBSERVED_NOT_FROZEN
provisionalPathRefs: 4
canonicalResolvedRefs: 0
blockedOrUnassessed: 4
```

No se presupone que los cuatro paths necesiten document ID. Owner/reviewer debe clasificar
autoridad versus navegación.

## Resolución

El resolver:

1. valida sintaxis/tipo;
2. consulta el registro correspondiente en subject commit;
3. verifica existencia/lifecycle;
4. aplica resolution mode;
5. comprueba revision/hash;
6. detecta successor si target no vigente;
7. reporta outcome sin reescribir source.

Outcomes:

```text
RESOLVED | RESOLVED_HISTORICAL | STALE_REVISION |
TARGET_MISSING | TARGET_RETIRED | AMBIGUOUS | TYPE_MISMATCH
```

Un target `SUPERSEDED` no se redirige automáticamente: el consumer decide si debe seguir successor
o conservar revisión histórica.

## Lifecycle y compatibilidad

- `ACTIVE_REVISION` puede resolver a una revisión nueva compatible.
- Un cambio incompatible requiere revisar consumers aunque ID sea estable.
- `PINNED_*` queda histórico y sólo cambia mediante nueva referencia/review.
- Retiro/supersession abre finding en refs activas.
- Mover path no afecta referencia `DOCUMENT`; registry actualiza localización.
- Cambiar identity/split/merge requiere mapping DIDA.

## Grafo

Las referencias forman edges tipados:

```text
source documentId --relation--> target typed ID@revision
```

- edges de autoridad y derivación participan en trazabilidad;
- `NAVIGATES_TO` participa en reachability, no autoridad;
- ciclos `GOVERNED_BY` y `DERIVED_FROM` son inválidos salvo excepción contractual explícita;
- ciclos de navegación pueden ser válidos.

## Reporte

```yaml
schemaVersion: 1
subjectCommit: <sha>
registryHashes:
  document: <hash>
  spec: <hash>
  adr: <hash>
references:
  - sourceId: <SDD-DOC>
    field: authorityRefs | generatedFrom | successorRef
    target: <typed reference>
    outcome: <enum>
    findingCodes: [<DREFxxx>]
```

Orden por source ID, field, refType, refId; sin timestamps/rutas absolutas.

## Códigos

| Código | Condición |
| --- | --- |
| `DREF001` | schema/refType/relation/resolutionMode inválido |
| `DREF002` | refId inválido o type mismatch |
| `DREF003` | target ausente, no registrado o path inseguro |
| `DREF004` | revision/hash ausente, stale o incompatible |
| `DREF005` | status/lifecycle target incompatible |
| `DREF006` | authority/generatedFrom/successor cardinalidad inválida |
| `DREF007` | legacy path sin commit/hash/estrategia/review |
| `DREF008` | reconciliación pierde autoridad o inventa target |
| `DREF009` | cycle inválido |
| `DREF010` | registry drift o resolución no determinista |
| `DREF011` | contenido sensible/ref externa insegura |
| `DREF012` | migration/review/supersession incompleta |

## Ratchet

```yaml
before:
  pilotLegacyPathRefs: 4
  pilotCanonicalRefs: 0
afterRequired:
  pilotLegacyPathRefs: 0
  pilotCanonicalRefs: <resultado revisado>
  unresolvedWithoutFinding: 0
  authorityLoss: 0
```

El after no exige cuatro refs canónicas: algunas pueden colapsarse a SPEC o retirarse como
no-authority. Sí exige decisión/mapping por cada una.

## Seguridad

- Refs no contienen secrets, signed URLs, emails personales ni paths absolutos.
- Artifacts externos se referencian por registry/hash, no URL temporal.
- El resolver no accede a red.
- Un target sensible puede resolverse por ID sin copiar metadata restringida.

## Criterios de salida

- [x] Schema tipado, modos, lifecycle y resolver especificados.
- [x] Legacy path y cuatro estrategias de reconciliación especificados.
- [x] Cuatro refs provisionales del piloto inventariadas.
- [x] Doce códigos y ratchet definidos.
- [x] Especificar fixtures `DREF`.
- [ ] Clasificar/reconciliar las cuatro refs con owner/reviewer.
- [ ] Aprobar schema mediante DOC-REV.
- [ ] Implementar resolver sólo después de aprobación.

Los últimos tres checks permanecen abiertos. Los casos normativos están definidos en
`document-reference-fixture-catalog.md`; canonical refs del piloto: `0`.
