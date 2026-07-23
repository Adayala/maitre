# Contrato de evidencia de evaluación de renderer — SPEC-225

## Propósito

Definir un paquete inmutable y verificable para observar, comparar y seleccionar candidatos de
renderer Markdown bajo `MD-RENDER-001`. La evidencia registra resultados; no concede autoridad ni
activa profiles.

## Identidades

```text
Evaluation package: MD-RENDER-EVAL-NNN
Candidate:          MD-RENDER-CAND-NNN
Execution:          MD-RENDER-RUN-NNN
Finding:            MD-RENDER-FIND-NNN
Decision:           MD-RENDER-DEC-NNN
```

Los IDs no se reutilizan. Corregir un package crea nueva revisión y `supersedes`; no muta el
registro previo.

## Envelope

```yaml
schemaVersion: 1
evaluationId: MD-RENDER-EVAL-NNN
selectionRef: MD-RENDER-001
status: DRAFT | COMPLETE | IN_REVIEW | ACCEPTED | REJECTED | STALE | SUPERSEDED
subject:
  commit: <sha completo>
  snapshotRef: <SDD-SNAP/ref>
  scopeHash: sha256:<hex>
inputs:
  consumerDecisionRef: <ref>
  contractHashes:
    consumer: sha256:<hex>
    profile: sha256:<hex>
    conformanceCatalog: sha256:<hex>
    link: sha256:<hex>
    navlCatalog: sha256:<hex>
    fragmentRegister: sha256:<hex>
  fixtureSetHash: sha256:<hex>
  fragmentSetHash: sha256:<hex>
candidates: [<candidate records>]
runs: [<run refs>]
comparisonRef: <artifact + hash>
divergenceRef: <artifact + hash>
findings: [<finding IDs>]
decisionRef: <MD-RENDER-DEC-NNN o null>
reviewRef: <DOC-REV-NNN o null>
supersedes: <evaluationId o null>
```

`ACCEPTED` requiere package completo y DOC-REV; no implica por sí mismo profile `ACTIVE`.

## Candidate record

Además de la identidad definida en el manifest:

```yaml
candidate:
  candidateId: MD-RENDER-CAND-NNN
  profileDraftRef: <profileId@revision>
  consumerRefs: [MD-CONS-NNN]
  components:
    - name: <paquete/binario/image>
      version: <exacta>
      immutableRef: <digest/commit>
      artifactHash: sha256:<hex>
      license: <SPDX/ref>
      sourceRef: <ref>
  environment:
    os: <valor fijado>
    architecture: <valor fijado>
    runtime: <nombre@versión>
    lockfileHash: sha256:<hex>
    imageDigest: <sha256 o null>
    locale: <valor>
    timezone: UTC
    network: DISABLED
  eligibility: PROPOSED | ELIGIBLE | REJECTED | SELECTED
  rejectionFindings: [<IDs>]
```

Locale y OS se registran aunque no deberían afectar output. Si lo afectan, se abre finding de
portabilidad/determinismo.

## Run record

```yaml
run:
  runId: MD-RENDER-RUN-NNN
  candidateId: MD-RENDER-CAND-NNN
  repetition: 1 | 2
  fixtureSetHash: sha256:<hex>
  fragmentSetHash: sha256:<hex>
  environmentHash: sha256:<hex>
  startedFromCleanState: true
  networkObserved: false
  exitCode: <entero>
  stdoutHash: sha256:<hex>
  stderrHash: sha256:<hex>
  resultArtifact:
    ref: <path>
    sha256: <hex>
  outcomes:
    fixtures:
      total: 48
      observed: 48
      errors: 0
    fragments:
      total: 10
      resolved: 0
      notFound: 0
      ambiguous: 0
```

Los conteos deben cerrar. Output bruto puede conservarse como artifact; el record no copia logs
ilimitados ni contenido sensible.

## Observation

Una observation por fixture:

```yaml
fixtureObservation:
  fixtureId: RENDER-FIX-NNN
  inputSha256: <hex>
  parserOutcome: HEADING | NOT_HEADING | ERROR
  generatedIds: [<strings exactos>]
  excludedLocations: [<refs>]
  normalizedOutputSha256: <hex>
  diagnostics: [<códigos estables>]
```

Una observation no puede omitir caracteres invisibles: acompaña cada string con representación
Unicode escapada cuando corresponda.

Las evaluaciones de fragments usan el schema de `markdown-fragment-validation-register.md`.

## Determinismo

Las repeticiones 1 y 2 deben tener:

- mismos inputs/environment hashes;
- mismos outcomes por fixture/fragment;
- mismos generated IDs en orden;
- mismo artifact normalizado;
- ausencia de red;
- estado limpio equivalente.

`stdout`/`stderr` pueden diferir sólo en campos explícitamente no comparables y redactados antes del
hash. La allowlist de campos no comparables es versionada; no admite regex global.

## Comparison artifact

```yaml
comparison:
  schemaVersion: 1
  evaluationId: <ID>
  candidates: [<IDs ordenados>]
  fixtures:
    - fixtureId: RENDER-FIX-NNN
      outputs:
        - candidateId: <ID>
          generatedIds: [<values>]
      relation: IDENTICAL | DIVERGENT | ERROR
  fragments:
    - fragmentId: FRAG-NNN
      outcomes:
        - candidateId: <ID>
          outcome: RESOLVED | NOT_FOUND | AMBIGUOUS
      relation: IDENTICAL | DIVERGENT | ERROR
```

No se ocultan filas idénticas: el artifact demuestra cobertura completa 48+10.

## Divergence manifest

Cada `DIVERGENT` produce:

```yaml
divergence:
  divergenceId: MD-RENDER-DIV-NNN
  subjectType: FIXTURE | FRAGMENT
  subjectId: <RENDER-FIX | FRAG>
  candidateOutputs: [<refs/values>]
  consumerImpact: <descripción + evidence>
  strategy: PRIMARY_WITH_WARNINGS | INTERSECTION_REQUIRED |
    EXPLICIT_ANCHORS_REQUIRED | UNDECIDED
  disposition: ACCEPT_PRIMARY | REMEDIATE_DOC | REJECT_CANDIDATE |
    REQUIRE_MORE_EVIDENCE | BLOCKED
  owner: <assignment o UNASSIGNED>
  findingRef: <ID o null>
```

`UNDECIDED` o owner `UNASSIGNED` impiden selection si afecta consumidor material.

## Decision record

```yaml
decision:
  decisionId: MD-RENDER-DEC-NNN
  evaluationId: MD-RENDER-EVAL-NNN
  status: DRAFT | ISSUED | SUPERSEDED
  outcome: SELECT | REQUEST_MORE_EVIDENCE | REJECT_ALL | BLOCKED
  selectedCandidate: <candidateId o null>
  selectedProfile: <profileId@revision o null>
  rationaleRefs: [<comparison/divergence/findings>]
  rejectedCandidates:
    - candidateId: <ID>
      findingRefs: [<IDs>]
  unresolvedFindings: [<IDs>]
  proposedEffectiveFrom: <commit o null>
  ownerAssignment: <OWN ref>
  reviewRef: <DOC-REV o null>
```

Consistencia:

- `SELECT` exige un solo candidato `ELIGIBLE`, cero finding eliminatorio abierto y profile exacto.
- `REJECT_ALL` exige al menos un finding eliminatorio por candidato.
- `REQUEST_MORE_EVIDENCE` identifica evidence faltante.
- `BLOCKED` identifica blocker/authority externo.
- La decisión permanece `DRAFT` mientras se obtiene review.
- `ISSUED` se serializa atómicamente con `reviewRef`; no se edita después.
- Una corrección crea otro decision ID y marca la anterior `SUPERSEDED` mediante referencia desde
  el successor, sin alterar evidencia de runs.

## Findings

```yaml
finding:
  findingId: MD-RENDER-FIND-NNN
  severity: BLOCKER | HIGH | MEDIUM | LOW
  code: <RSELxxx>
  subjectRef: <candidate/run/fixture/fragment/divergence>
  evidenceRefs: [<refs>]
  expectedResolution: <condición>
  owner: <assignment o UNASSIGNED>
  status: OPEN | OWNERSHIP_BLOCKED | IN_REVIEW | RESOLVED |
    ACCEPTED_EXCEPTION
  expiresAt: <fecha o null>
```

Findings `BLOCKER/HIGH` abiertos impiden `SELECT`. Excepciones requieren owner, razón, mitigación y
vencimiento; nunca permiten red, versiones mutables o output no determinista.

## Códigos

| Código | Condición |
| --- | --- |
| `RSEL001` | envelope, ID, status o supersession inválidos |
| `RSEL002` | commit/snapshot/scope o input hash ausente/inconsistente |
| `RSEL003` | candidate component/version/provenance incompleto o mutable |
| `RSEL004` | entorno no fijado, red habilitada/observada o estado no limpio |
| `RSEL005` | run/repetición ausente, duplicado o environment/input drift |
| `RSEL006` | cobertura/conteos de fixtures o fragments incompletos |
| `RSEL007` | output no determinista o normalización no autorizada |
| `RSEL008` | comparison/divergence incompleto o inconsistente |
| `RSEL009` | finding/excepción inválido o finding eliminatorio oculto |
| `RSEL010` | decision/outcome contradice candidatos, findings o evidencia |
| `RSEL011` | review/assignment/activación inválidos o prematuros |
| `RSEL012` | contenido sensible o serialización no determinista |

Los códigos son estables para schemaVersion 1.

## Serialización y seguridad

- YAML UTF-8, LF, claves en orden canónico definido por schema.
- Listas de IDs/paths ordenadas salvo generated IDs, que preservan orden del documento.
- Paths relativos; cero rutas absolutas.
- Sin timestamps en artifacts comparables de run/comparison.
- Sin tokens, cookies, credentials, PII ni environment dumps.
- Secrets detectados se redactan antes de persistir y abren `RSEL012`; el hash del secret no se
  registra.
- Componentes y licenses se referencian; no se embeben binarios.

## Staleness

El package pasa a `STALE` si cambia cualquier input hash, subject commit, snapshot, fixture,
fragment, candidate component, environment o consumer authority. Un review posterior no revive
evidence stale; requiere nuevo package/supersession.

## Relación con DOC-REV

`document-review-evidence-contract.md` admite subjects:

```text
EVALUATION_PACKAGE | TOOL_PROFILE
```

- `EVALUATION_PACKAGE`: revisa envelope, runs, comparison, divergences y decisión.
- `TOOL_PROFILE`: revisa activación/compatibilidad del profile seleccionado.

Son reviews separables. Aprobar evaluation no activa profile si falta review de `TOOL_PROFILE`.

## Criterios de salida

- [x] Envelope y records de candidate/run/observation especificados.
- [x] Comparison, divergence, decision y findings especificados.
- [x] Doce códigos de validación definidos.
- [x] Seguridad, determinismo y staleness especificados.
- [x] Especificar fixtures positivas/negativas `RSEL`.
- [ ] Aprobar schemaVersion 1 mediante DOC-REV.
- [ ] Implementar validador sólo después de aprobación.
- [ ] Emitir primer package real desde `MD-RENDER-001`.

Los últimos tres checks permanecen abiertos; no existe evidence package real. Los casos normativos
están definidos en `markdown-renderer-evaluation-fixture-catalog.md`.
