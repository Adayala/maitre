# Contrato de schema para mappings de migración — SPEC-225

## Propósito

Los lotes documentales necesitan explicar cómo cada fragmento legacy se conserva, divide, combina,
excluye o transforma en nodos canónicos. Este contrato define un formato común y determinista.

## Documento

```yaml
schemaVersion: 1
batchId: SDD-MIG-NNN
artifactType: OBJECTIVE | REQUIREMENT | RULE | BOUNDARY | CRITERION | MILESTONE | TASK | TRACEABILITY | LEGACY_CHECK
sourceSnapshot:
  baselineCommit: <sha completo>
  path: <ruta relativa>
  fileSha256: <sha256>
entries: []
generatedBy: MANUAL_REVIEW | TOOL_DRAFT
status: DRAFT | IN_REVIEW | ACCEPTED
review:
  reviewer: <asignación o UNASSIGNED>
  reviewedCommit: <sha completo o null>
  outcome: PENDING | APPROVE | REQUEST_CHANGES
```

Un draft generado por tooling no obtiene autoridad hasta review humano.

## Entrada

```yaml
source:
  locator:
    headingPath: [<H1>, <H2>, <H3>]
    startLine: <entero informativo>
    endLine: <entero informativo>
  textSha256: <hash del texto normalizado>
  excerpt: <texto acotado>
classification: PRESERVE | EDITORIAL | SPLIT | MERGE | DUPLICATE | NON_NORMATIVE | OUT_OF_SCOPE | CONFLICT
targets: [<IDs canónicos>]
aliases: [<IDs legacy>]
reason: <explicación>
decisionRefs: [<ADR/finding/review>]
status: PROPOSED | ACCEPTED | REJECTED
```

Líneas ayudan a revisión, pero `textSha256` y heading path identifican el fragmento porque las líneas
cambian al editar.

## Normalización para hash

Antes de calcular `textSha256`:

1. usar UTF-8;
2. normalizar saltos a LF;
3. remover whitespace final de cada línea;
4. preservar mayúsculas, acentos, puntuación y espacios internos;
5. preservar fences y contenido de código;
6. asegurar un único newline final.

No se normaliza Unicode de forma que cambie identificadores, ejemplos o texto contractual. Si el
repositorio adopta NFC, se registra como nueva versión de schema.

`fileSha256` se calcula sobre bytes del archivo baseline, sin normalización.

## Clasificaciones

- `PRESERVE`: misma semántica, se asigna identidad/referencia.
- `EDITORIAL`: sólo formato/claridad, sin cambio normativo.
- `SPLIT`: una fuente produce varios targets atómicos.
- `MERGE`: varias fuentes equivalentes producen un target.
- `DUPLICATE`: fuente redundante apunta a autoridad ya elegida.
- `NON_NORMATIVE`: ejemplo, rationale, nota o tarea en artefacto incorrecto.
- `OUT_OF_SCOPE`: requiere otro lote/autoridad.
- `CONFLICT`: fuentes incompatibles; bloquea hasta decisión.

`NON_NORMATIVE` no significa borrar: el texto puede conservarse en sección apropiada.

## Splits y merges

Un `SPLIT` enumera todos los targets y explica la dimensión de separación. Cada target conserva
source ref.

Un `MERGE` usa el mismo target en varias entries y una decision ref que elige redacción/autoridad. No
se fusionan obligaciones incompatibles bajo un texto ambiguo.

## Aliases

Los aliases son globalmente únicos y resuelven a exactamente un target. Sólo se agregan aliases que
existían en el baseline o fueron publicados mediante decisión explícita.

Una referencia a ADR/SPK no se convierte en alias de OBJ/REQ/RULE/AC.

## Conflictos

`CONFLICT` registra:

```yaml
conflict:
  alternatives: [<source/target refs>]
  impact: <consumidores/gates>
  owner: <asignación o UNASSIGNED>
  requiredEvidence: [<refs esperadas>]
  targetGate: <gate>
```

No se elige alternativa por orden de archivo, fecha o mayor detalle.

## Traceability edges

El mapping de edges usa:

```yaml
sourceId: <nodo>
edge: REALIZES | CONSTRAINS | ALLOCATED_TO | VERIFIED_BY | PLANNED_IN | DELIVERED_BY | EVIDENCED_BY | BLOCKED_BY | DEPENDS_ON | SUPERSEDED_BY
targetId: <nodo>
reason: <por qué existe>
status: PROPOSED | ACCEPTED | REJECTED
```

Edges inferidos por tooling permanecen `PROPOSED`.

## Legacy checks

```yaml
source:
  path: <tasks/verification>
  textSha256: <hash>
observedMark: CHECKED | UNCHECKED
classification: EVIDENCED | UNVERIFIED_DONE | NOT_A_CRITERION | NOT_A_TASK
targetIds: [<IDs>]
evidenceRefs: [<refs>]
findingId: <ID o null>
```

Un check marcado sin evidencia se clasifica `UNVERIFIED_DONE`; no se desmarca ni se promueve.

## Determinismo

- documentos ordenados por `artifactType`;
- entries ordenadas por path, heading path y text hash;
- targets/aliases/refs ordenados lexicográficamente;
- claves en orden del schema;
- sin timestamps de generación en contenido determinista;
- misma entrada y decisiones produce bytes idénticos.

## Privacidad y seguridad

Mappings no incluyen secrets, tokens, PII, payloads fiscales crudos ni dumps. Excerpts se acotan al
texto documental necesario. Evidencia externa usa referencias y hashes.

## Evolución

Cambiar campos o semántica incrementa `schemaVersion` y aporta migración/fixtures. Un reader rechaza
versiones desconocidas; no ignora campos normativos silenciosamente.

## Fixtures requeridas

- preserve simple;
- split uno-a-varios;
- merge varios-a-uno;
- alias legacy;
- duplicate;
- non-normative conservado;
- conflict bloqueante;
- edge cross-spec;
- checked sin evidencia;
- hash/archivo stale;
- schemaVersion desconocida.

Los inputs, outcomes y códigos esperados están definidos en
`migration-mapping-fixture-catalog.md`.

## Criterios de salida

- [ ] Schema aprobado por Governance + Architecture.
- [ ] Fixtures positivas/negativas especificadas.
- [ ] SDD-MIG-001 usa schemaVersion 1.
- [ ] Hashes y orden son reproducibles.

Los checks permanecen abiertos; no se congeló baseline.
