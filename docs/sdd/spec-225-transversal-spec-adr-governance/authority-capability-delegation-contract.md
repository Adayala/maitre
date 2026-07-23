# Contrato de autoridad, competencia y delegación — SPEC-225

## Propósito

Definir cómo una asignación `OWN` demuestra autoridad suficiente para aprobar un acto concreto.
Complementa el contrato de ownership: estar asignado a un rol no implica automáticamente poder
aceptar riesgo, aprobar policy, delegar o escalar.

Este contrato no asigna personas, grupos ni permisos.

## Modelo

```text
IDENTITY ──has──> ASSIGNMENT ──grants──> CAPABILITY
                         ├──within──> SCOPE
                         ├──bounded-by──> RISK TIER
                         └──may-delegate-under──> DELEGATION POLICY

ACT ──requires──> CAPABILITY SET + SEGREGATION + VALIDITY
```

Una decisión es autorizada sólo si todas las capabilities requeridas se resuelven desde assignments
aceptados, vigentes y compatibles con el scope/risk tier del acto.

## Capabilities canónicas

| Capability | Autoriza |
| --- | --- |
| `OWN_SCOPE` | responder por outcomes del scope |
| `REVIEW_TECHNICAL` | evaluar corrección técnica |
| `REVIEW_DOMAIN` | evaluar semántica de dominio |
| `ACCEPT_RISK` | aceptar riesgo residual dentro del tier |
| `APPROVE_POLICY` | aprobar/cambiar policy normativa |
| `MAINTAIN_BASELINE` | materializar artifacts ya aprobados |
| `REVOKE_ACCEPTANCE` | invalidar aceptación vigente |
| `ESCALATE_AUTHORITY` | resolver/escalar falta de autoridad |
| `AUDIT_GOVERNANCE` | revisar proceso y segregación |

Las capabilities no conceden acceso productivo, credenciales, deployment ni administración del
repositorio.

## Risk tiers

```yaml
riskTiers:
  T0: editorial/reversible/sin cambio normativo
  T1: contrato local/reversible/impacto acotado
  T2: contrato cross-domain, deuda MEDIUM o cambio operativo material
  T3: seguridad, privacidad, dinero, fiscalidad, tenant isolation o riesgo HIGH
  T4: riesgo BLOCKER, pérdida de datos o incumplimiento legal
```

El tier efectivo es el máximo derivado por criterios aplicables. El solicitante no lo selecciona.
Ambigüedad entre tiers elige el superior hasta review.

Este contrato describe autoridad, pero no vuelve exceptuables `T3/T4` ni categorías prohibidas.

## Assignment extendido

```yaml
assignmentId: OWN-NNN
subject:
  identityId: <identity ref>
  identityType: PERSON | GROUP
scope:
  type: SPEC | DOMAIN | GOVERNANCE | ORGANIZATION
  id: <stable scope ID>
capabilities: [<capability>]
maximumRiskTier: T0 | T1 | T2 | T3 | T4
status: PROPOSED | ACCEPTED | SUSPENDED | EXPIRED | REVOKED
validity:
  effectiveFrom: <commit/ref>
  acceptedAt: <UTC>
  expiresAt: <UTC|null>
constraints:
  excludedActs: [<act IDs/types>]
  conflicts: [<conflict refs>]
delegation:
  allowed: <bool>
  maximumDepth: <entero>
  allowedCapabilities: [<capability>]
evidenceRef: <acceptance evidence>
```

Los assignments legacy sin capabilities/risk tier no autorizan actos nuevos: se resuelven como
`AUTHORITY_UNASSESSED`.

## Grupos

Un `GROUP` cuenta sólo si existen:

- identidad durable del grupo;
- fuente autoritativa de membership;
- member que ejecutó el acto;
- membership vigente al decidir;
- aceptación del scope por el grupo;
- evidencia preservada sin exponer datos innecesarios.

Un alias textual, mailing list o equipo mencionado en Markdown no basta. Los cambios futuros de
membership no reescriben decisiones históricas.

## Matriz de actos

| Acto | Tier mínimo | Capabilities mínimas | Segregación |
| --- | --- | --- | --- |
| Aprobar cambio editorial | `T0` | `REVIEW_TECHNICAL` | autor puede revisar si policy lo permite |
| Aprobar contrato local | `T1` | `OWN_SCOPE`, `REVIEW_TECHNICAL` | owner y reviewer distintos |
| Aprobar contrato cross-domain | `T2` | `OWN_SCOPE`, `REVIEW_TECHNICAL`, `REVIEW_DOMAIN` | mínimo dos identidades |
| Aceptar deuda `MEDIUM` | `T2` | `ACCEPT_RISK`, `REVIEW_TECHNICAL`, `APPROVE_POLICY` | según `SDBP` |
| Cambiar policy de deuda | `T2` | `OWN_SCOPE`, `APPROVE_POLICY`, `AUDIT_GOVERNANCE` | mínimo tres identidades |
| Materializar baseline aprobado | tier del baseline | `MAINTAIN_BASELINE` | maintainer no sustituye reviewers |
| Revocar aceptación | tier original | `REVOKE_ACCEPTANCE` o `APPROVE_POLICY` | inmediata; review posterior permitido |
| Acto `T3/T4` | `T3/T4` | policy específica | bloqueado hasta policy aprobada |

La matriz específica puede exigir más, nunca menos.

## Delegación

Una delegación:

```yaml
delegationId: OWN-DEL-NNN
delegatorAssignmentRef: OWN-NNN
delegateIdentityRef: <identity>
capabilities: [<subset>]
scope: <subset>
maximumRiskTier: <igual o menor>
effectiveFrom: <commit/ref>
expiresAt: <UTC obligatorio>
reason: <motivo>
acceptanceEvidenceRef: <ref>
```

- no amplía scope, tier, vigencia ni capabilities;
- no delega `APPROVE_POLICY`, `AUDIT_GOVERNANCE` o `ESCALATE_AUTHORITY` por defecto;
- respeta `maximumDepth`; ciclos están prohibidos;
- delegator y delegate no cuentan como identidades independientes para segregación del mismo acto;
- suspensión/revocación del origen invalida delegaciones derivadas;
- subdelegación requiere permiso explícito.

## Escalamiento

La relación “superior” es una arista explícita, no un título inferido:

```yaml
authorityRelationId: OWN-AUTH-NNN
lowerAssignmentRef: OWN-NNN
higherAssignmentRef: OWN-NNN
capability: <capability>
scope: <scope>
minimumRiskTier: <tier>
status: PROPOSED | ACCEPTED | REVOKED
evidenceRef: <ref>
```

Debe ser acíclica. Si no existe relación aceptada, el sistema reporta
`ESCALATION_UNRESOLVED`; no elige manager, admin, owner global ni miembro “más senior”.

## Conflictos y recusación

Conflictos mínimos:

- autoría/interés directo en el resultado;
- dependencia jerárquica que anule independencia requerida;
- ownership simultáneo de riesgo y control mitigante;
- custodia exclusiva de evidence;
- participación en evidence cuestionada.

Recusación:

- se registra antes de decidir cuando es conocida;
- reemplazo requiere assignment/capability equivalente;
- abstención no reduce cardinalidad requerida;
- conflicto descubierto después crea finding y puede volver stale/revocar la decisión.

## Resolución temporal

Se evalúa autoridad en `decidedAt`:

- assignment y membership deben estar vigentes;
- expiración posterior no invalida la historia;
- backdating está prohibido;
- cambio de scope/capability posterior requiere nueva asignación;
- clock y commit se congelan para reproducibilidad.

## Fuente y proyección

Se propone un [registro autoritativo versionado](ownership-authority-registry-contract.md), todavía
sin path aprobado. README, CODEOWNERS,
branch protection y providers externos son proyecciones/controles, no la fuente única.

Toda proyección declara:

```yaml
sourceAssignmentIds: [OWN-NNN]
generatedAtCommit: <sha>
projectionType: README | CODEOWNERS | BRANCH_PROTECTION | PROVIDER_GROUP
driftStatus: IN_SYNC | DRIFTED | UNKNOWN
```

Un provider externo puede reforzar enforcement, pero una API inaccesible no debe fabricar
autoridad. Se reporta `UNKNOWN/BLOCKED`.

## Códigos

| Código | Condición |
| --- | --- |
| `OWNA001` | schema/ID/status de capability/assignment inválido |
| `OWNA002` | identity/group/membership no verificable |
| `OWNA003` | scope/capability/tier insuficiente o ambiguo |
| `OWNA004` | assignment no vigente, backdated o stale |
| `OWNA005` | segregación/cardinalidad/conflicto incumplido |
| `OWNA006` | delegación amplía autoridad, expira o forma ciclo |
| `OWNA007` | escalation relation ausente, inválida o cíclica |
| `OWNA008` | acto/decision no corresponde a authority matrix |
| `OWNA009` | revocación/suspensión no invalida derivados |
| `OWNA010` | proyección/provider drift se trata como autoridad |
| `OWNA011` | evidence sensible o acceso indebido |
| `OWNA012` | resolución temporal/orden/reporte no determinista |

## Estado

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
authorityRegistryPath: NOT_DECIDED
canonicalCapabilities: 9
riskTiers: 5
acceptedCapabilityAssignments: 0
acceptedAuthorityRelations: 0
acceptedDelegations: 0
```

## Criterios de salida

- [x] Capabilities, tiers, actos y segregación especificados.
- [x] Grupos, delegación, escalamiento y recusación especificados.
- [x] Validez temporal, proyecciones y drift especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `OWNA`.
- [ ] Aprobar registro, identity provider y authority matrix.
- [ ] Crear assignments/relations sólo con aceptación verificable.
