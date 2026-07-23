# Contrato de baseline de deuda histórica de validación — SPEC-225

## Propósito

Definir cómo registrar findings históricos aceptados temporalmente sin convertir el baseline en una
allowlist permanente. Este contrato no crea el archivo baseline ni acepta deuda actual.

## Estado

```yaml
historicalBaseline:
  schemaVersion: 1
  status: NOT_CREATED
  canonicalPath: PROPOSED_.sdd/baselines/validation
  subjectCommit: NOT_FROZEN
  scopeHash: NOT_FROZEN
  acceptedFindings: 0
  owner: UNASSIGNED
  reviewers: [UNASSIGNED]
  reviewRef: null
```

Las auditorías y conteos existentes son candidate inventory; no satisfacen un baseline aceptado.
La ruta física, pointer e historia se rigen por
[el contrato del repositorio de baselines](historical-baseline-repository-contract.md); la propuesta
todavía requiere aprobación.

## Qué es y qué no es

El baseline:

- identifica deuda confirmada sobre un commit/scope;
- permite adoptar un ratchet sin exigir limpieza total inmediata;
- conserva owner, razón, remediación y retiro;
- falla ante deuda nueva o drift.

No:

- convierte finding en válido;
- oculta warnings/errors;
- aprueba contenido;
- reemplaza issue/finding lifecycle;
- se regenera automáticamente;
- permite “actualizar snapshot” para pasar un PR.

## Envelope

```yaml
schemaVersion: 1
baselineId: SDD-BASE-NNN
status: DRAFT | ACTIVE | STALE | SUPERSEDED | RETIRED
subject:
  commit: <sha completo>
  validatorVersion: <ref exacta>
  configHash: sha256:<hex>
  scopeHash: sha256:<hex>
  registryHashes: [<nombre + hash>]
policy:
  severityCeiling: <policy ref>
  defaultExpiryDays: <entero o null>
  additionsAllowed: false
entries: [<finding baseline records>]
summary: <conteos por public/detail code/severity>
review:
  ownerAssignment: <OWN ref>
  reviewerAssignments: [<OWN refs>]
  reviewRef: <DOC-REV>
  reviewedCommit: <sha completo>
supersedes: <baselineId o null>
```

`ACTIVE` requiere subject/policy/entries/review completos.

## Entry

```yaml
finding:
  baselineFindingId: SDD-BASE-FIND-NNNNN
  publicCode: <SDD/ADR code>
  detailCode: <subcódigo o null>
  severity: BLOCKER | HIGH | MEDIUM | LOW | WARNING
  subject:
    subjectType: SPEC | ADR | DOCUMENT | LINK | REGISTRY | INDEX | CONFIG
    subjectId: <ID estable o LEGACY identity>
    pathHint: <path relativo>
    relationKey: <target/field/edge o null>
  fingerprint:
    algorithm: SDD_FINDING_V1
    semanticHash: sha256:<hex>
  observedAt:
    commit: <sha completo>
    sourceBlobOrSha256: <hash>
    lineHint: <entero o null>
  acceptance:
    reason: <justificación>
    issueRef: <finding/issue durable>
    ownerAssignment: <OWN ref>
    mitigation: <control temporal>
    expiresAt: <fecha o null>
    removalCondition: <condición verificable>
    reviewRef: <DOC-REV>
  status: ACCEPTED_TEMPORARY | RESOLVED | EXPIRED | SUPERSEDED
  successorFindingId: <ID o null>
```

`lineHint` y `pathHint` ayudan al usuario; no forman identidad por sí solos.

## Identidad semántica

Fingerprint incluye:

```text
publicCode + detailCode + subjectType + stable subjectId +
relationKey + normalized criterion identity
```

No incluye:

- número de línea;
- texto completo del mensaje;
- path cuando existe ID estable;
- timestamp;
- orden del scan.

Para legacy sin ID, usa path normalizado + blob/content identity + mapping ref. Migrar a ID estable
crea successor mapping; no duplica ni “resuelve” deuda por renombre.

## Elegibilidad

Puede baselinearse sólo si:

- finding fue reproducido/confirmado;
- no es falso positivo;
- preexiste al rollout ratchet;
- tiene owner aceptado;
- existe issue/removal condition;
- mitigación/riesgo son explícitos;
- reviewer acepta alcance temporal;
- no pertenece a una categoría no exceptuable.

No exceptuables:

- secret/credential/PII expuesto;
- path traversal/SSRF/ejecución insegura;
- ID activo duplicado/reutilizado;
- aislamiento tenant o autorización vulnerados;
- corrupción/pérdida de datos;
- evidencia falsificada;
- validator que escribe o requiere red indebidamente.

Un BLOCKER/HIGH requiere política/autoridad específica; este contrato no lo habilita por defecto.

## Expiración

- `expiresAt` requerido salvo removal condition basada en milestone aprobada.
- Expired finding falla required gate.
- Renovación crea review/successor, no edita silenciosamente aceptación previa.
- `UNASSIGNED`, “algún día” o issue inexistente no son condiciones válidas.
- Cerrar issue no marca finding resuelto; el validator debe dejar de observarlo.

## Bootstrap

Proceso:

1. congelar validator/config/scope/commit;
2. ejecutar scan completo read-only;
3. deduplicar por fingerprint;
4. clasificar falsos positivos por fixtures/fix, no baseline;
5. separar findings no exceptuables;
6. asignar owner/issue/mitigación/retiro;
7. revisar entries y summary;
8. publicar baseline DRAFT;
9. ejecutar validator contra DRAFT;
10. emitir DOC-REV y activar;
11. habilitar `RATCHET_REQUIRED`.

No se activa baseline antes de tener validator/fixtures materializadas.

## Comparación

Cada scan clasifica:

```text
UNCHANGED | MOVED | RESOLVED | NEW | DRIFTED | REAPPEARED | EXPIRED
```

- `UNCHANGED`: mismo fingerprint.
- `MOVED`: mismo fingerprint, location hint distinto.
- `RESOLVED`: ya no se observa.
- `NEW`: fingerprint sin entry.
- `DRIFTED`: entry ID coincide pero semántica/code/target cambió.
- `REAPPEARED`: finding resuelto vuelve.
- `EXPIRED`: acceptance ya no vigente.

Sólo `UNCHANGED/MOVED` aceptados temporalmente no agregan error de ratchet. Los demás fallan según
policy; `RESOLVED` exige retirar entry en successor baseline.

## Ratchet

```yaml
rules:
  newFindings: 0
  driftedFindings: 0
  reappearedFindings: 0
  expiredFindings: 0
  acceptedCount: NON_INCREASING
  severityByCode: NON_INCREASING
  resolvedEntriesRetainedActive: 0
```

Una excepción nueva durante rollout requiere proceso extraordinario separado; el default
`additionsAllowed: false` impide que la misma PR agregue finding y baseline entry para pasar.
El proceso, autoridad y lifecycle se rigen por el
[contrato de excepciones de deuda](validation-debt-exception-governance-contract.md).

## Successor baseline

Un baseline `ACTIVE` es inmutable. Cambios crean successor:

- mismo validator/config/scope o migration explícita;
- mappings para entries moved/reidentified;
- resolved entries salen del conjunto activo pero quedan en historia;
- review del delta y summary before/after;
- predecessor pasa `SUPERSEDED` después de activar successor.

No se reescribe historia ni se cambia expiry en sitio.

## Candidate inventory actual

Observaciones documentadas, todavía no entries aceptadas:

```yaml
candidateInventoryId: SDD-BASE-CAND-001
status: UNASSESSED_NOT_BASELINED
signals:
  documentMetadataLegacyTracked: 2153
  trackedNavigationOrphans: 289
  brokenWorktreeLinks: 2
  readinessLegacyWalkingSkeleton: 36
  reviewTargetsUnassessed: 71
  dependenciesUnassessed: 70
  genericBlockers: 40
  canonicalTraceabilityNodes: 0
acceptedBaselineEntries: 0
```

Estos son conteos heterogéneos/cortes de auditoría. No equivalen al número de findings que producirá
el validator ni pueden copiarse uno-a-uno al baseline.

## Reporte de delta

```yaml
schemaVersion: 1
baselineId: <ID>
subjectCommit: <sha>
validatorVersion: <ref>
summary:
  unchanged: 0
  moved: 0
  resolved: 0
  new: 0
  drifted: 0
  reappeared: 0
  expired: 0
results: [<finding identity + classification>]
```

Orden por public code, detail code, subject identity, relation key.

## Códigos

| Código | Condición |
| --- | --- |
| `SDBL001` | schema/baseline ID/status/path inválido |
| `SDBL002` | subject commit/validator/config/scope/hash inconsistente |
| `SDBL003` | entry/fingerprint/subject identity inválido o duplicado |
| `SDBL004` | owner/issue/reason/mitigation/removal incompleto |
| `SDBL005` | finding no elegible/no exceptuable baselineado |
| `SDBL006` | expiry/renewal/status/successor inválido |
| `SDBL007` | NEW/DRIFTED/REAPPEARED mal clasificado u oculto |
| `SDBL008` | ratchet crece o resolved entry permanece activa |
| `SDBL009` | move/rename/migration pierde identidad/history |
| `SDBL010` | review/activation/supersession prematura o stale |
| `SDBL011` | contenido sensible o path inseguro |
| `SDBL012` | serialización/delta/output no determinista |

## Seguridad

- Baseline no copia source/message completo si puede contener secretos.
- Findings sensibles no se aceptan; se remedia/excluye de publicación segura.
- Paths relativos y IDs estables.
- Evidence restringida se referencia por ID/hash.
- Parser seguro, read-only y sin red.

## Criterios de salida

- [x] Envelope, entry, fingerprint y lifecycle especificados.
- [x] Elegibilidad, no-exceptuables, expiry y bootstrap especificados.
- [x] Delta, ratchet y successor baseline especificados.
- [x] Candidate inventory separado de baseline aceptada.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `SDBL`.
- [ ] Aprobar schema/path/policy.
- [ ] Ejecutar bootstrap sólo después del validator.
- [ ] Activar baseline/ratchet mediante DOC-REV.

Los últimos cuatro checks permanecen abiertos; accepted entries actuales: `0`.
