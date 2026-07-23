# Contrato de autoría, readiness y change class de ADRs — SPEC-225

## Propósito

Definir la estructura mínima, criterios de revisión, clases de cambio y transiciones de un ADR. El
contrato complementa el registro ADR; no crea template físico, directorios ni decisiones nuevas.

## Estado

```yaml
adrAuthoring:
  schemaVersion: 1
  status: PROPOSED_FOR_REVIEW
  templatePath: NOT_CREATED
  owner: UNASSIGNED
  reviewers: [UNASSIGNED]
  effectiveFrom: null
```

ADRs existentes permanecen legacy y no cambian de estado por este contrato.

## Template lógico

```markdown
# ADR-NNN — Título

Metadata

## Contexto y problema
## Alcance y fuera de alcance
## Drivers y constraints
## Opciones consideradas
## Decisión propuesta | Decisión
## Consecuencias
### Positivas
### Negativas y riesgos
## Criterios de aceptación
## Evidencia requerida
## Rollback / alternativa si falla
## Triggers de revisión
## Relaciones y supersession
## Historial de revisiones
```

Una sección puede usar `NOT_APPLICABLE` sólo con razón. No se agregan párrafos vacíos para cumplir
forma.

## Metadata

Además del contrato de registro:

```yaml
adr:
  id: ADR-NNN
  title: <texto>
  status: PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED
  createdDate: <YYYY-MM-DD>
  decisionDate: <YYYY-MM-DD o null>
  deciderAssignments: [<OWN refs>]
  relatedSpecs: [<SPEC IDs>]
  relatedAdrs: [<ADR IDs>]
  targetIncrement: <ref o null>
  changeClass: <enum>
  blockers: [<finding IDs>]
  acceptedRevision: <sha completo o null>
  supersedes: [<ADR IDs>]
  supersededBy: <ADR ID o null>
  reviewRefs: [<DOC-REV IDs>]
```

Una fecha/identidad textual no sustituye assignments o review.

## Semántica de secciones

### Contexto y problema

Describe fuerzas actuales, decisión necesaria y costo de no decidir. No presenta la opción elegida
como hecho inevitable.

### Alcance

Declara sistemas, dominios, entornos y horizonte afectados. “Fuera de alcance” evita que un ADR
absorba decisiones no revisadas.

### Drivers y constraints

Cada driver es verificable o enlaza evidencia. Restricciones temporales se etiquetan con trigger de
revisión; preferencias no se presentan como constraints.

### Opciones

Incluye al menos:

- mantener status quo cuando sea viable;
- opción elegida;
- alternativas materiales rechazadas;
- criterios comparables y evidence gaps.

Una lista de productos sin trade-offs no satisface la sección.

### Decisión

- `PROPOSED` usa “Decisión propuesta” y lenguaje no efectivo.
- `ACCEPTED` usa “Decisión”, scope y obligaciones inequívocas.
- No contiene implementación detallada que pertenezca a specs.
- Una decisión condicionada declara condiciones y fallback.

### Consecuencias

Incluye beneficios, costos, riesgos, deuda, operación, seguridad, portabilidad y consumers
afectados según aplique. No registra sólo aspectos positivos.

### Acceptance/evidence

Criterios poseen identidad/evidence refs cuando el ADR depende de spikes, mediciones o gates.
Checkbox/texto no equivale a resultado. `ACCEPTED` requiere outcomes, no sólo criterios escritos.

### Rollback y triggers

Rollback describe reversibilidad y datos/consumers afectados. Triggers son condiciones observables,
no “revisar en el futuro”.

## Change classes

```text
EDITORIAL | CLARIFICATION | COMPATIBLE_EXTENSION |
MATERIAL_REVISION | SUPERSESSION | DEPRECATION
```

| Clase | Semántica | Lifecycle |
| --- | --- | --- |
| `EDITORIAL` | ortografía/formato/links sin semántica | conserva ADR/status |
| `CLARIFICATION` | explicita intención ya decidida, sin ampliar obligación | conserva, re-review acotado |
| `COMPATIBLE_EXTENSION` | agrega detalle compatible/consumer previsto | conserva ID, review de consumers |
| `MATERIAL_REVISION` | cambia opción, scope, constraint o trade-off material | nuevo ADR o reabrir sólo si aún PROPOSED |
| `SUPERSESSION` | reemplaza decisión aceptada | nuevo ADR + relaciones recíprocas |
| `DEPRECATION` | inicia retiro sin successor inmediato obligatorio | status/lifecycle revisado |

Un ADR `ACCEPTED` no se reescribe con `MATERIAL_REVISION`; se crea successor. La clasificación no se
infiere sólo por cantidad de líneas.

## Change assessment

```yaml
adrChange:
  changeId: ADR-CHG-NNN
  adrId: ADR-NNN
  baselineCommit: <sha>
  proposedCommit: <sha>
  proposedClass: <enum>
  semanticDimensions:
    optionChanged: true | false
    scopeChanged: true | false
    obligationsChanged: true | false
    constraintsChanged: true | false
    consumersChanged: true | false
    evidenceChanged: true | false
    lifecycleChanged: true | false
  impactedRefs: [<SPEC/ADR/document IDs>]
  findings: [<IDs>]
  reviewRef: <DOC-REV o null>
```

Si cualquier cambio material se marca `EDITORIAL/CLARIFICATION`, el assessment falla.

## Readiness checklist

IDs estables:

| ID | Criterio |
| --- | --- |
| `ADR-RDY-01` | problema/scope/fuera de alcance inequívocos |
| `ADR-RDY-02` | drivers/constraints con provenance |
| `ADR-RDY-03` | opciones materiales y status quo comparados |
| `ADR-RDY-04` | decisión propuesta separada de hecho efectivo |
| `ADR-RDY-05` | consecuencias positivas/negativas/riesgos |
| `ADR-RDY-06` | security/privacy/tenancy evaluados o N/A justificado |
| `ADR-RDY-07` | portability/cost/operations evaluados o N/A |
| `ADR-RDY-08` | acceptance criteria y evidence requirements trazables |
| `ADR-RDY-09` | rollback/fallback y triggers observables |
| `ADR-RDY-10` | specs/ADRs/consumers y dependencies enlazados |
| `ADR-RDY-11` | deciders/reviewers aceptados y conflictos declarados |
| `ADR-RDY-12` | blockers/findings resueltos o excepción válida |
| `ADR-RDY-13` | change class correcta y baseline/diff revisados |
| `ADR-RDY-14` | revision/fecha/lifecycle/supersession consistentes |

Outcomes por criterio:

```text
PASS | FAIL | NOT_APPLICABLE | INCONCLUSIVE
```

`NOT_APPLICABLE` exige razón. `INCONCLUSIVE` bloquea aceptación.

## Transiciones

### `PROPOSED → ACCEPTED`

Requiere:

- 14 criterios aplicables en `PASS`;
- decider assignments aceptados;
- evidence requerida con outcomes;
- cero blocker crítico/alto abierto;
- related specs/ADRs resolubles;
- accepted revision completa;
- DOC-REV sobre commit exacto;
- decisión efectiva consistente con wording.

### `ACCEPTED → DEPRECATED`

Requiere alternativa/condición de retiro, consumers, mitigación, fecha/trigger y review.

### `ACCEPTED/DEPRECATED → SUPERSEDED`

Requiere successor aceptado, relaciones recíprocas, migration/consumer impact y review.

No hay transición automática desde implementación, merge, checkbox o spike aislado.

## Evidencia y decisiones condicionadas

Un ADR propuesto puede depender de evidence:

```yaml
decisionGate:
  gateId: ADR-GATE-NNN
  evidenceRefs: [<SPK/evidence IDs>]
  requiredOutcomes: [<condiciones>]
  actualOutcomes: [<valores o NOT_RUN>]
  fallbackRef: <opción/ADR>
  status: NOT_READY | READY_FOR_DECISION | BLOCKED
```

Completar todos los spikes no selecciona opción automáticamente; deciders evalúan trade-offs y
registran decisión.

## Línea base ADR-001–004

| ADR | Estado | Contexto | Opciones | Decisión | Consecuencias | Acceptance | Triggers/rollback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ADR-001 | `ACCEPTED` | presente | presente | presente | presente | no explícito | triggers presentes |
| ADR-002 | `PROPOSED` | presente | presente | propuesta | presente | presente | alternativa si falla |
| ADR-003 | `PROPOSED` | presente | presente | propuesta | presente | presente | no explícito |
| ADR-004 | `PROPOSED` | presente | presente | propuesta | presente | presente | trigger presente |

```yaml
baselineId: ADR-AUTH-BASE-001
status: OBSERVED_LEGACY_NOT_FROZEN
adrs: 4
fullyEvaluatedAgainstReadiness14: 0
changeAssessments: 0
automaticStateChanges: 0
```

La tabla sólo observa secciones. No reabre ADR-001 ni evalúa semántica/approval retroactivamente.

## Template físico futuro

El futuro template:

- vive en path aprobado bajo `docs/adr/`;
- se identifica `GUIDE`, no ADR registrable;
- usa placeholders inequívocos;
- no recibe ID/estado real;
- queda excluido del allocator ADR;
- enlaza este contrato/checklist;
- posee ejemplos sin aparentar approval.

Crear el archivo/directorio es implementación documental posterior, fuera de este bloque.

## Códigos

| Código | Condición |
| --- | --- |
| `ADRT001` | metadata/template/schema inválido |
| `ADRT002` | sección requerida ausente/vacía/placeholder |
| `ADRT003` | contexto/scope/drivers insuficientes o contradictorios |
| `ADRT004` | opciones incompletas o comparación sesgada/no trazable |
| `ADRT005` | decisión wording/status/scope incompatible |
| `ADRT006` | consecuencias/riesgos/operación/security omitidos |
| `ADRT007` | acceptance/evidence/gate insuficiente o auto-promovido |
| `ADRT008` | rollback/trigger/consumer impact ausente |
| `ADRT009` | change class incorrecta o material change oculto |
| `ADRT010` | transición/lifecycle/supersession inválido |
| `ADRT011` | decider/reviewer/conflict/review inválido |
| `ADRT012` | serialización, refs, staleness o contenido sensible inválido |

`ADR001/002` siguen siendo códigos públicos del registro; `ADRT*` detallan authoring/readiness.

## Criterios de salida

- [x] Template lógico y semántica de secciones especificados.
- [x] Seis change classes y assessment especificados.
- [x] Checklist de 14 criterios y transiciones especificado.
- [x] Baseline estructural ADR-001–004 relevado.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `ADRT`.
- [ ] Aprobar contrato/checklist.
- [ ] Crear template físico sólo después de aprobación.
- [ ] Evaluar/migrar ADRs legacy por review.

Los últimos tres checks permanecen abiertos. Los casos normativos están definidos en
`adr-authoring-fixture-catalog.md`.
