# Contrato del policy profile de deuda de validación — SPEC-225

## Propósito

Definir los parámetros versionados que gobiernan baselines históricos y excepciones `SDEX`. Este
contrato propone valores conservadores, pero no asigna autoridades, no aprueba la policy y no
habilita excepciones.

## Identidad

```yaml
policyProfile:
  policyId: SDD-DEBT-POLICY-001
  schemaVersion: 1
  status: PROPOSED_NOT_APPROVED
  effectiveFrom: null
  supersedes: null
  approvedCommit: null
  reviewRef: null
```

Una ejecución debe resolver una única policy por ID y hash. Configuraciones parciales, defaults
ocultos o mezcla de versiones fallan cerrado.

## Perfil propuesto

```yaml
historicalBaseline:
  allowedSeverities: [MEDIUM, LOW, WARNING]
  blockerAllowed: false
  highAllowed: false
  defaultExpiryDays: 90
  maximumExpiryDays: 180
  additionsAllowed: false
  acceptedCount: NON_INCREASING
exception:
  enabled: false
  allowedSeverities: [MEDIUM, LOW, WARNING]
  maximumInitialExpiryDays:
    MEDIUM: 30
    LOW: 60
    WARNING: 90
  renewal:
    maximumRenewals: 1
    maximumRenewalDays: 30
    escalationFromRenewal: 1
  blockerAllowed: false
  highAllowed: false
```

`exception.enabled: false` permanece hasta aprobar policy, authority assignments, repositorio,
fixtures y CI verifier. Los valores son límites máximos; un reviewer puede exigir menos tiempo o
rechazar la solicitud.

## Severidad

La severity proviene del criterio normativo del validator, no del solicitante. No puede reducirse
para entrar en policy.

| Severidad | Baseline histórico propuesto | Excepción nueva propuesta |
| --- | --- | --- |
| `BLOCKER` | Prohibido | Prohibido |
| `HIGH` | Prohibido | Prohibido |
| `MEDIUM` | Elegible con review | Máximo 30 días |
| `LOW` | Elegible con review | Máximo 60 días |
| `WARNING` | Elegible con review | Máximo 90 días |

Las categorías no exceptuables siguen prohibidas sin importar severidad.

## Authority matrix propuesta

Refs concretas permanecen pendientes:

| Acto | Risk owner | Technical reviewer | Policy reviewer | Baseline maintainer |
| --- | --- | --- | --- | --- |
| Activar baseline histórico | requerido | 1 requerido | 1 requerido | requerido |
| Aprobar excepción `MEDIUM` | requerido | 2 requeridos | 1 requerido | separado |
| Aprobar excepción `LOW/WARNING` | requerido | 1 requerido | 1 requerido | separado |
| Renovar una vez | requerido | mismos mínimos | reviewer superior requerido | separado |
| Revocar | risk owner o policy reviewer | consultado | notificado | ejecuta successor |
| Cambiar esta policy | requerido | 2 requeridos | 2 requeridos | no decide |

Reglas:

- identidades distintas cuentan una sola vez por rol/acto;
- ausencia, rechazo o expiración de un assignment bloquea;
- requester/autor no satisface reviewer ni risk owner;
- un grupo sólo cuenta si el assignment identifica miembros/autoridad verificable;
- bots, CI y maintainers no aceptan riesgo.

“Reviewer superior” requiere una authority relation aprobada; mientras no exista, renovación queda
bloqueada.

Capabilities, risk tiers y relaciones de escalamiento se resuelven conforme al
[contrato de autoridad](authority-capability-delegation-contract.md).

## Cálculo de vigencia

```text
expiresAt <= decidedAt + maximumInitialExpiryDays[severity]
```

- se calcula en UTC calendario, no horas laborales;
- `decidedAt` y clock del validator deben estar congelados;
- el vencimiento ocurre al alcanzar `expiresAt`;
- timezone/locale no alteran el resultado;
- reducción posterior del máximo no invalida retroactivamente una aprobación, salvo decisión
  explícita de migration/revocation;
- un successor de policy define tratamiento de approvals vigentes.

Milestones sin fecha sólo se permiten para baseline histórico y requieren además un review date
máximo de 90 días. No sustituyen expiry en excepciones nuevas.

## Renovación

- máximo propuesto: una renovación;
- usa nueva `exceptionId`, review y successor;
- duración máxima: 30 días y nunca mayor al límite inicial de la severity;
- debe demostrar progreso de remediación;
- exige reviewer de autoridad superior no participante en la aprobación anterior;
- una segunda renovación queda prohibida por esta versión;
- partir una excepción en múltiples fingerprints para evadir el límite es incumplimiento.

## Activación

Orden mínimo:

1. aprobar contrato y fixtures `SDBL`, `SDBS`, `SDEX` y `SDBP`;
2. materializar/ejecutar fixtures;
3. asignar authority refs y owners;
4. aprobar root, schemas y retention;
5. aprobar policy hash mediante `DOC-REV`;
6. activar verifier en shadow;
7. crear baseline histórico si corresponde;
8. activar ratchet required;
9. sólo entonces evaluar cambiar `exception.enabled`.

La activación parcial no hereda valores propuestos como defaults.

## Versionado y cambios

Un cambio en severidades, duraciones, roles, renovaciones, categorías o enforcement crea nueva
`policyId` o versión mayor según el registro que se apruebe.

- ampliar elegibilidad/duración es `BREAKING_RISK_INCREASE`;
- restringir policy requiere migration de approvals vigentes;
- cambios editoriales no alteran hash semántico;
- predecessor queda inmutable y enlazado por `supersedes`;
- un validator declara policy ID y hash efectivos en output.

## Override y emergencia

No existen:

- flag `--ignore-policy`;
- variable de entorno para habilitar exceptions;
- override por branch, actor, label o comentario;
- fallback a policy embebida;
- modo “temporary allow all”.

Una emergencia operativa puede usar procedimientos de deploy/revert fuera de este contrato, pero no
reescribe el resultado del validator ni crea aceptación de deuda implícita.

## Métricas

Reporte mínimo por policy:

```yaml
policyId: SDD-DEBT-POLICY-001
policyHash: sha256:<hex>
activeHistoricalEntries: 0
approvedOpenExceptions: 0
renewedExceptions: 0
expiredExceptions: 0
revokedExceptions: 0
daysToExpiryBuckets: {}
countsBySeverity: {}
countsByOwner: {}
```

Las métricas no contienen mensajes/source sensibles y no son autoridad para selección.

## Códigos

| Código | Condición |
| --- | --- |
| `SDBP001` | policy ID/schema/status/version inválido |
| `SDBP002` | policy ausente, múltiple, parcial o hash inconsistente |
| `SDBP003` | severity/categoría elegible contradice prohibiciones |
| `SDBP004` | expiry/default/maximum/cálculo inválido |
| `SDBP005` | authority matrix/assignment/segregación insuficiente |
| `SDBP006` | renovación excede cantidad, duración o escalamiento |
| `SDBP007` | activación prematura o secuencia incompleta |
| `SDBP008` | cambio/versionado/migration/supersession inválido |
| `SDBP009` | override/fallback/emergency bypass altera policy |
| `SDBP010` | baseline/excepción excede policy efectiva |
| `SDBP011` | exposición sensible o acceso indebido en config/métricas |
| `SDBP012` | resolución/cálculo/reporte no determinista |

## Estado

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
proposedPolicyId: SDD-DEBT-POLICY-001
policyFileCreated: false
policyHashFrozen: false
authorityRefsAssigned: 0
exceptionEnabled: false
approvedExceptions: 0
```

## Criterios de salida

- [x] Perfil, severidades, vigencias y renovaciones propuestos.
- [x] Authority matrix y segregación propuestas.
- [x] Activación, versionado, overrides y métricas especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `SDBP`.
- [ ] Resolver refs/authority hierarchy y aprobar valores.
- [ ] Aprobar path/schema/hash mediante `DOC-REV`.
- [ ] Mantener excepciones deshabilitadas hasta completar gates.
