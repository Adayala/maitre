# Contrato de evidencia de revisión documental — SPEC-225

## Propósito

Registrar una revisión humana reproducible sobre documentos, schemas, snapshots o lotes. Esta
evidencia es distinta de `ImplementationEvidence`: evalúa el contrato/documentación, no demuestra
comportamiento ejecutado.

## Identidad

Formato:

```text
DOC-REV-NNN
```

Un review record es inmutable después de emitido. Correcciones crean otro record que lo supersede.

## Schema lógico

```yaml
schemaVersion: 1
reviewId: DOC-REV-NNN
subject:
  type: SPEC | CONTRACT_REVISION | SCHEMA | FIXTURE_CATALOG | SNAPSHOT |
    MIGRATION_BATCH | EVALUATION_PACKAGE | TOOL_PROFILE | ADR
  id: <SPEC-NNN | SDD-MIG-NNN | SDD-SNAP-NNN | nombre/version>
  targetOutcome: <outcome solicitado>
revision:
  reviewedCommit: <sha completo>
  paths:
    - path: <ruta relativa>
      blobOrSha256: <hash>
inputs:
  checklist: <contract-review-checklist version/ref>
  dependencyRefs: [<ADRs/findings/reviews>]
dimensions:
  - id: <dimensión estable>
    outcome: PASS | FAIL | NOT_APPLICABLE | INCONCLUSIVE
    evidenceRefs: [<paths/IDs>]
    findings: [<IDs>]
reviewer:
  assignmentRef: <OWN-NNN>
  identity: <identidad verificable>
  conflicts: [<declaraciones>]
recordedAt: <timestamp UTC>
outcome: APPROVE | REQUEST_CHANGES | BLOCKED
supersedes: <DOC-REV-NNN o null>
```

Los timestamps no participan en artifacts deterministas derivados, pero son obligatorios en el
record firmado/registrado.

## Subjects y alcance

- `SPEC`: paquete documental y metadata de una spec.
- `CONTRACT_REVISION`: compatibilidad/consumidores de una revisión.
- `SCHEMA`: schema normativo, por ejemplo mapping/snapshot v1.
- `FIXTURE_CATALOG`: suficiencia de casos y outcomes esperados.
- `SNAPSHOT`: scope, hashes, provenance y freeze.
- `MIGRATION_BATCH`: mappings, ratchet y diff final.
- `EVALUATION_PACKAGE`: inputs, executions, comparisons, divergencias y decisión registrada.
- `TOOL_PROFILE`: identidad, compatibilidad y activación propuesta de tooling versionado.
- `ADR`: forma/consistencia del record; la decisión sigue su gobernanza específica.

Un record revisa paths/hashes explícitos. No cubre “todo el directorio” implícitamente.

## Dimensiones

El checklist general aporta IDs estables para:

```text
SCOPE | DOMAIN | DATA | API | EVENTS | SECURITY | DESIGN |
PORTABILITY | COST | UX_A11Y | QUALITY | OPERATIONS | TRACEABILITY
```

Sólo se usa `NOT_APPLICABLE` con razón/evidence ref. `INCONCLUSIVE` bloquea si la dimensión es
requerida por subject/riesgo.

## Outcomes

- `APPROVE`: todas las dimensiones requeridas pasan; cero findings bloqueantes.
- `REQUEST_CHANGES`: existen cambios documentales accionables y findings identificados.
- `BLOCKED`: falta autoridad, decisión, evidencia externa, secret/provider access o prerequisite.

`APPROVE` documental:

- aprueba únicamente subject, paths y commit declarados;
- no ejecuta gates;
- no prueba implementación;
- no promueve automáticamente estado/readiness;
- sólo contribuye a `READY_FOR_IMPLEMENTATION` cuando todos los contratos de lifecycle, ownership,
  blockers, dependencias y evidencia se satisfacen.

## Reviewer y conflictos

`assignmentRef` debe estar `ACCEPTED` y vigente para scope/rol. El reviewer declara conflictos. En
subjects críticos no puede ser el autor único ni aprobar su propia excepción.

Una identidad textual sin assignment aceptado produce `BLOCKED`, no `APPROVE`.

## Findings

Todo `FAIL` o `INCONCLUSIVE` requerido enlaza finding con severidad, ubicación, criterio y resolución
esperada. Findings críticos/altos impiden `APPROVE`, salvo excepción vigente conforme a gobernanza.

Editar el review record no resuelve findings; se registra evidencia/outcome del finding.

## Staleness

Un record se vuelve stale cuando:

- cambia `reviewedCommit`;
- cambia hash de un path revisado;
- cambia schema/checklist normativo relevante;
- cambia una decisión/dependencia que altera el outcome;
- expira/revoca la asignación antes de emitir el record.

Cambios editoriales fuera de paths no invalidan. Un cambio posterior crea nuevo review; no muta el
anterior.

## Aplicación a SDD-MIG-001

Prerequisites documentales separados:

1. review de mapping schema v1;
2. review de catálogo MAP;
3. review de snapshot schema v1;
4. review de catálogo SNAP;
5. review/freeze de SDD-SNAP-001;
6. review final del batch SDD-MIG-001.

La aprobación de schemas/fixtures no aprueba mappings concretos ni el lote final.

## Seguridad

Records no contienen secrets, tokens, PII ni payloads sensibles. Evidencia externa se referencia con
hash/retención/acceso, sin copiar contenido prohibido.

## Validaciones

- ID/schema/outcome canónicos.
- SHA completo y paths únicos.
- Hashes corresponden al reviewed commit/worktree snapshot.
- Reviewer assignment aceptado y sin conflicto prohibido.
- Dimensiones requeridas presentes.
- PASS/FAIL poseen evidence/finding según corresponda.
- Outcome consistente con dimensiones.
- Supersession válida y acíclica.

## Criterios de salida

- [ ] Schema aprobado.
- [ ] Checklist posee IDs de dimensión estables.
- [ ] Fixtures positivas/negativas especificadas.
- [ ] Reviews del piloto usan DOC-REV.

Los checks permanecen abiertos.

Los casos positivos/negativos y códigos esperados están definidos en
`document-review-fixture-catalog.md`.
