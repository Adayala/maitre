# Contrato de excepciones de deuda de validación — SPEC-225

## Propósito

Definir el proceso extraordinario para aceptar temporalmente un finding nuevo cuando el ratchet
normal lo rechaza. Este contrato no aprueba excepciones, no amplía categorías elegibles y no permite
que una excepción se autoconsuma desde la misma propuesta.

## Principio

La excepción:

- es un acto de aceptación temporal de riesgo, no una corrección;
- se aplica a un finding semántico exacto;
- requiere autoridad separada del autor;
- expira y debe ser removida;
- crea un successor baseline revisado;
- nunca convierte `additionsAllowed` en `true` de forma global.

El camino preferido sigue siendo remediar el finding o corregir un falso positivo mediante contrato
y fixtures.

## Elegibilidad

Una solicitud puede evaluarse sólo si:

1. el finding es reproducible con validator/config/scope congelados;
2. es `NEW` y no `DRIFTED`, `REAPPEARED` ni una deuda histórica mal clasificada;
3. no existe una corrección segura dentro de la ventana operativa declarada;
4. el impacto de bloquear el cambio está documentado;
5. existe mitigación temporal verificable;
6. owner, issue y fecha/milestone de remoción están aceptados;
7. no pertenece a una categoría no exceptuable.

Siguen siendo no exceptuables: secretos/PII expuestos, traversal/SSRF/ejecución insegura, IDs
reutilizados, ruptura de tenant isolation/autorización, corrupción/pérdida de datos, evidencia
falsificada y validators con writes/red indebidos.

Un falso positivo no se exceptúa: se corrige el criterio y se agrega fixture de regresión.

## Solicitud

```yaml
schemaVersion: 1
exceptionId: SDD-EXC-NNN
status: DRAFT | UNDER_REVIEW | APPROVED | REJECTED | EXPIRED | CONSUMED | REVOKED
finding:
  publicCode: <code>
  detailCode: <code|null>
  subjectType: <type>
  subjectId: <stable ID>
  relationKey: <key|null>
  semanticHash: sha256:<hex>
subject:
  commit: <sha completo>
  validatorVersion: <ref exacta>
  configHash: sha256:<hex>
  scopeHash: sha256:<hex>
risk:
  severity: BLOCKER | HIGH | MEDIUM | LOW | WARNING
  reason: <por qué no se remedia ahora>
  impactIfBlocked: <impacto verificable>
  impactIfAccepted: <riesgo residual>
  mitigation: <control verificable>
removal:
  issueRef: <issue durable>
  ownerAssignment: <OWN ref>
  expiresAt: <UTC RFC3339>
  removalCondition: <condición verificable>
review:
  requesterAssignment: <OWN ref>
  riskOwnerAssignment: <OWN ref>
  technicalReviewerAssignments: [<OWN refs>]
  policyReviewerAssignment: <OWN ref>
  reviewRef: <DOC-REV>
decision:
  outcome: APPROVE | REJECT | null
  rationale: <texto|null>
  decidedAt: <UTC RFC3339|null>
  decidedCommit: <sha|null>
baselineSuccessorId: <SDD-BASE-NNN|null>
```

`APPROVED` requiere todos los campos y una revisión sobre el commit exacto.

## Autoridad y segregación

Roles mínimos:

- requester: presenta evidencia; no decide;
- risk owner: acepta explícitamente riesgo residual;
- technical reviewer: verifica finding, alternativas y mitigación;
- policy reviewer: confirma elegibilidad y precedentes;
- baseline maintainer: materializa el successor después de la decisión.

Restricciones:

- requester no puede ser el único risk owner ni reviewer;
- baseline maintainer no sustituye aprobación;
- autor del cambio no aprueba su propia excepción;
- `BLOCKER/HIGH` requiere autoridad reforzada definida por política aprobada;
- si la autoridad reforzada está `UNASSIGNED`, la excepción no puede aprobarse;
- bots y CI verifican evidencia, pero no aceptan riesgo.

## Decisión y consumo

Flujo:

```text
DRAFT → UNDER_REVIEW → APPROVED → CONSUMED → EXPIRED
                     ↘ REJECTED
APPROVED/CONSUMED → REVOKED
```

- `APPROVED` aún no modifica el baseline.
- `CONSUMED` significa que un successor baseline exacto incorporó el finding.
- El successor referencia `exceptionId`, review y hash de la solicitud.
- Consumo requiere PR separada o un changeset claramente separable con aprobación posterior a la
  observación del finding; la propuesta que introdujo el finding no puede autoaprobarse.
- Una excepción se consume una sola vez y para un único fingerprint.
- Rechazo, expiry o revocación impiden consumo.

## Vigencia

- `expiresAt` es obligatorio y no puede superar el máximo de la policy aprobada.
- La vigencia comienza en `decidedAt`, no en merge/consumo.
- Al expirar, el finding clasifica `EXPIRED` y falla el gate.
- Renovar requiere nueva `exceptionId`, nueva evidencia y nuevo review.
- Renovaciones repetidas elevan autoridad; el umbral exacto debe aprobarse en policy.
- Resolver el finding antes del vencimiento obliga a retirarlo en el siguiente successor.

Los límites y la authority matrix propuestos se especifican en
[el policy profile de deuda](validation-debt-policy-profile-contract.md); no están activos.

## Revocación

Puede revocarse ante:

- mitigación incumplida;
- severidad o alcance mayor al evaluado;
- nueva evidencia de categoría no exceptuable;
- owner/issue inválido;
- falsedad o staleness de la evidencia;
- cambio de validator/config/scope que invalida el assessment.

La revocación es inmediata para el gate. No se demora hasta regenerar baseline: el registro de
revocación autoritativo invalida la aceptación y exige successor de limpieza.

## Precedentes y anti-normalización

- Una excepción previa no crea derecho a otra.
- Fingerprints similares se evalúan individualmente.
- El reporte agrupa recurrencia por code/owner/causa para detectar normalización.
- Renovaciones y excepciones repetidas generan finding de gobernanza.
- No se permite “presupuesto” genérico de N findings.
- No puede usarse una excepción para aumentar el severity ceiling global.

## Registro y evidencia

Ruta física propuesta, sujeta a la misma aprobación que el repositorio de baselines:

```text
.sdd/baselines/validation/exceptions/
├── requests/SDD-EXC-NNN.yaml
└── evidence/SDD-EXC-NNN.review.yaml
```

Los documentos aprobados/consumidos son inmutables. Cambios posteriores son eventos/referencias,
no ediciones silenciosas. Contenido sensible se redacta y se referencia mediante ID/hash.

No se creó esta ruta ni se seleccionó como fuente autoritativa.

## Ratchet de excepciones

```yaml
exceptionRatchet:
  approvedOpen: NON_INCREASING
  expiredOpen: 0
  revokedStillAccepted: 0
  consumedMoreThanOnce: 0
  renewedWithoutEscalation: 0
  nonExceptuableApproved: 0
```

El conteo no reemplaza revisión individual ni autoriza cupos.

## Códigos

| Código | Condición |
| --- | --- |
| `SDEX001` | schema/ID/status/path de excepción inválido |
| `SDEX002` | finding/subject/hash/config/scope inconsistente |
| `SDEX003` | finding no elegible o categoría no exceptuable |
| `SDEX004` | riesgo/alternativas/mitigación/remoción incompletos |
| `SDEX005` | ownership/segregación/autoridad insuficiente |
| `SDEX006` | review/decisión/commit stale o inconsistente |
| `SDEX007` | consumo inválido, duplicado o para otro fingerprint |
| `SDEX008` | expiry/renovación/revocación inválida |
| `SDEX009` | successor baseline no preserva trazabilidad/ratchet |
| `SDEX010` | excepción usada como precedente/cupo/policy global |
| `SDEX011` | contenido sensible, path inseguro o acceso indebido |
| `SDEX012` | evaluación/reporte/serialización no determinista |

## Estado

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
exceptionPolicyApproved: false
authorityAssignmentsComplete: false
exceptionRepositoryCreated: false
requestsCreated: 0
exceptionsApproved: 0
exceptionsConsumed: 0
```

## Criterios de salida

- [x] Elegibilidad, envelope, autoridad y segregación especificados.
- [x] Lifecycle, consumo, expiry, renovación y revocación especificados.
- [x] Precedentes, evidencia y ratchet especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `SDEX`.
- [ ] Aprobar authority matrix, máximos de vigencia y escalamiento.
- [ ] Aprobar ruta/retención mediante `DOC-REV`.
- [ ] Crear registro sólo si una excepción elegible es autorizada.
