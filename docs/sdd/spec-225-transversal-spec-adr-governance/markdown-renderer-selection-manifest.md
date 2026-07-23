# MD-RENDER-001 — Evaluación y selección de renderer Markdown

## Estado

```yaml
selectionId: MD-RENDER-001
status: PLANNED
subjectCommit: NOT_FROZEN
worktreeSnapshot: NOT_FROZEN
consumerDecision: NOT_APPROVED
selectedProfile: NOT_CONFIGURED
owner: UNASSIGNED
reviewers: [UNASSIGNED]
outcome: PENDING
reviewRef: null
effectiveFrom: null
```

Este manifest especifica un proceso de decisión. No ejecuta candidatos, no completa outputs
`UNRESOLVED` y no activa un renderer.

## Objetivo

Seleccionar una semántica de headings/fragments que:

- reproduzca al consumidor Markdown primario aprobado;
- pueda ejecutarse offline y con versiones exactas;
- resuelva de forma determinista las 48 fixtures de conformidad;
- evalúe los 10 fragments reales sin ocultar fallos;
- defina compatibilidad para consumidores secundarios y upgrades.

## Scope

```yaml
inputs:
  consumerInventory: markdown-consumer-authority-contract.md
  profileContract: markdown-renderer-profile-contract.md
  conformanceCatalog: markdown-renderer-conformance-fixture-catalog.md
  linkContract: markdown-link-reachability-contract.md
  navlCatalog: markdown-link-fixture-catalog.md
  fragmentRegister: markdown-fragment-validation-register.md
  conformanceCases: 48
  repositoryFragments: 10
candidateFamilies:
  - GITHUB_REPOSITORY_MARKDOWN
  - MULTI_RENDERER_INTERSECTION
conditionalAlternatives:
  - COMMONMARK_BASE
  - CUSTOM_MAITRE
```

Los candidatos condicionales no se implementan salvo finding que demuestre que los preferidos no
satisfacen autoridad/reproducibilidad.

## Fuera de scope

- cambiar links o headings;
- implementar scanner NAVL;
- incorporar dependencias al lockfile;
- crear CI/workflows;
- aprobar contenido de specs;
- resolver LINK-001/002;
- ejecutar NAV-01–04;
- baselinear failures nuevos;
- asignar personas sin aceptación.

## Condiciones de entrada

El manifest no pasa a `BASELINED` hasta cumplir:

- owner y reviewers aceptados;
- workflow de autores/revisores confirmado;
- consumer primario aprobado o decisión explícita de autoridad;
- subject commit y snapshot congelados;
- 48 inputs materializados con hashes;
- 10 rows `FRAG-*` con hashes de source/target/heading;
- candidatos reproducibles identificados por versiones exactas;
- entorno offline fijado;
- DOC-REV schema disponible.

## Identidad de candidatos

Cada candidato recibe record:

```yaml
candidate:
  candidateId: MD-RENDER-CAND-NNN
  consumerRefs: [MD-CONS-NNN]
  rendererFamily: <valor>
  rendererVersion: <exacta>
  sluggerImplementation: <valor>
  sluggerVersion: <exacta>
  packageOrImageRef: <ref inmutable>
  artifactHash: sha256:<hex>
  lockfileRef: <path + hash>
  licenseRef: <path/ref>
  networkRequired: false
  status: PROPOSED | ELIGIBLE | REJECTED | SELECTED
```

Un range, tag mutable, descarga en runtime o dependencia sin hash vuelve el candidato `REJECTED`.

## Ejecución de evaluación

Por candidato:

1. validar identidad/provenance;
2. ejecutar dos veces las 48 fixtures;
3. registrar heading IDs y exclusions sin normalización posterior;
4. comparar bytes de outputs repetidos;
5. ejecutar los 10 fragments reales sobre el mismo commit;
6. registrar diferencias contra otros candidatos;
7. clasificar blockers y compatibilidad;
8. producir matriz firmable de decisión.

La captura de outputs no cambia el catálogo normativo. Sólo review posterior puede promoverlos.

## Matriz de resultados

```yaml
candidateResult:
  candidateId: MD-RENDER-CAND-NNN
  subjectCommit: <sha>
  fixtureSetHash: sha256:<hex>
  environmentHash: sha256:<hex>
  conformance:
    total: 48
    observed: 48
    deterministic: 48
    errors: 0
  repositoryFragments:
    total: 10
    resolved: 0
    notFound: 0
    ambiguous: 0
  reproduction:
    offline: PASS | FAIL
    cleanEnvironment: PASS | FAIL
    repeatRun: PASS | FAIL
  secondaryConsumers:
    compatible: 0
    divergent: 0
    unassessed: 0
  blockers: [<finding refs>]
  evidenceRef: <artifact>
```

Los valores anteriores son schema, no resultados actuales.

## Criterios eliminatorios

El candidato queda `REJECTED` si:

- no reproduce al consumer primario;
- requiere red o estado mutable durante el gate;
- no fija renderer/slugger/versiones;
- produce output no determinista;
- no puede representar todos los casos del catálogo;
- falla seguridad de paths/encoding del contrato NAVL;
- oculta fragments fallidos;
- exige modificar documentación antes de poder medir su comportamiento.

Que un candidato resuelva los 10 links actuales no compensa un criterio eliminatorio.

## Comparación no automática

Para candidatos `ELIGIBLE`, reviewers comparan:

| Dimensión | Evidencia | Decisión humana requerida |
| --- | --- | --- |
| fidelidad | fixtures + consumer evidence | sí |
| reproducibilidad | lockfile/image + repeat runs | sí |
| fragments actuales | outcomes `FRAG-*` | sí |
| compatibilidad secundaria | divergence manifest | sí |
| mantenimiento | upgrade/ownership plan | sí |
| seguridad/supply chain | hashes/licencia/provenance | sí |

No existe score ponderado que seleccione automáticamente. La matriz impide ocultar trade-offs, no
reemplaza el ADR/DOC-REV.

## Outcomes

```text
SELECT | REQUEST_MORE_EVIDENCE | REJECT_ALL | BLOCKED
```

- `SELECT`: un candidato elegible se propone como profile activo.
- `REQUEST_MORE_EVIDENCE`: faltan casos/provenance; permanece `PLANNED` o `IN_REVIEW`.
- `REJECT_ALL`: cada candidato tiene finding eliminatorio; no se crea profile custom por defecto.
- `BLOCKED`: falta autoridad, assignee, snapshot o coordinación externa.

`SELECT` requiere además DOC-REV; el manifest por sí solo no activa el profile.

## Artefactos requeridos

```text
consumer-confirmation.yaml
baseline-snapshot.yaml
candidate-register.yaml
conformance-observations/
fragment-evaluations.yaml
candidate-comparison.yaml
divergence-manifest.yaml
selection-decision.yaml
doc-review.yaml
```

Los nombres representan artefactos lógicos pendientes; este documento no los crea.

Su envelope, records, consistencia y códigos mecánicos están definidos por
`markdown-renderer-evaluation-evidence-contract.md`.

## Ratchets

```yaml
before:
  selectedProfile: NOT_CONFIGURED
  conformanceObserved: 0
  repositoryFragmentsResolved: 0
afterRequired:
  selectedProfile: <profileId@revision>
  conformanceObserved: 48
  conformanceDeterministic: 48
  repositoryFragmentsAssessed: 10
  unresolvedWithoutFinding: 0
  networkRequired: false
  unversionedComponents: 0
  docReviewOutcome: APPROVE
```

`repositoryFragmentsAssessed: 10` permite outcomes fallidos sólo si tienen finding/decisión; no
fuerza maquillar todos como `RESOLVED`.

## Atomicidad y rollback

- Observaciones y decisión se revisan juntas contra el subject commit.
- Activación del profile, referencia desde NAVL y expected outputs normativos ocurren en el mismo
  cambio aprobado.
- Si la activación falla, se revierte la referencia efectiva; observations permanecen como
  evidencia histórica.
- Nunca se modifica el profile anterior; se marca `SUPERSEDED` sólo después de activar successor.
- Un rollback no restaura automáticamente links/headings cambiados por otra remediación.

## Concurrencia y staleness

El manifest pasa a `STALE` si cambia:

- alguno de los seis contratos/registros de input;
- fixture set/hash;
- cualquiera de los 10 source/target/heading hashes;
- identidad/versión de candidato;
- consumer authority;
- lockfile o entorno;
- subject commit revisado.

Un cambio no material requiere evidencia de hash/mapping; no se ignora por filename.

## Review mínimo

Dimensiones:

- `REV-SCOPE`;
- `REV-DESIGN`;
- `REV-TRACEABILITY`;
- `REV-QUALITY`;
- `REV-SECURITY`;
- `REV-OPERABILITY`.

Segregación requerida:

- owner de gobernanza propone;
- reviewer de arquitectura confirma fidelidad/compatibilidad;
- reviewer de ingeniería confirma reproducción/toolchain;
- ninguna ejecución se autoaprueba por haber pasado.

## Criterios de salida

- [ ] Manifest `BASELINED` con commit/snapshot.
- [ ] Consumer authority confirmada.
- [ ] Candidatos exactos registrados.
- [ ] 48 observations completas y deterministas.
- [ ] 10 fragments evaluados.
- [ ] Divergencias y findings revisados.
- [ ] Candidato seleccionado o rechazo explícito.
- [ ] DOC-REV sobre commit/artefactos exactos.
- [ ] Profile activado atómicamente o manifest cerrado sin selección.

Todos los checks permanecen abiertos. Estado: `PLANNED`.
