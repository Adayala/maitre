# Contrato de readiness para activar gobernanza SDD — SPEC-225

## Propósito

Definir el gate integrado que debe cumplirse antes de activar validación required, baseline
histórico, registro de autoridad, policy de deuda o excepciones. Evita que la aprobación aislada de
un documento habilite parcialmente el sistema.

Este contrato no aprueba ni activa componentes.

## Unidad de activación

```yaml
activation:
  activationId: SDD-GOV-ACT-NNN
  schemaVersion: 1
  status: DRAFT | READY_FOR_REVIEW | APPROVED | APPLIED | VERIFIED | REJECTED | STALE | ROLLED_BACK
  targetMode: SHADOW | RATCHET_REQUIRED | STRICT | EXCEPTIONS_ENABLED
  subjectCommit: <sha completo>
  components: [<component refs/hashes>]
  prerequisites: [<gate outcomes>]
  reviewRef: <DOC-REV|null>
  applicationEvidenceRef: <evidence|null>
  verificationEvidenceRef: <evidence|null>
  supersedes: <activationId|null>
```

Una activación representa un changeset exacto y un único target mode. No significa “última config
disponible”.

## Componentes congelados

El manifest declara ID, versión, path y hash de:

```text
VALIDATOR
VALIDATOR_FIXTURES
CI_INTEGRATION
CI_FIXTURES
HISTORICAL_BASELINE_CONTRACT
SDBL_FIXTURES
BASELINE_REPOSITORY_CONTRACT
SDBS_FIXTURES
EXCEPTION_CONTRACT
SDEX_FIXTURES
DEBT_POLICY
SDBP_FIXTURES
AUTHORITY_CONTRACT
OWNA_FIXTURES
AUTHORITY_REGISTRY_CONTRACT
OWNR_FIXTURES
ACTIVE_BASELINE
ACTIVE_AUTHORITY_REGISTRY
```

Un componente no requerido por el target mode se declara `NOT_APPLICABLE` con razón normativa; no
se omite.

## Gates comunes

Todo target mode requiere:

| Gate | Condición |
| --- | --- |
| `GAR-01-SCOPE` | paths, commit y target mode exactos |
| `GAR-02-CONTRACTS` | contratos requeridos aprobados, no stale |
| `GAR-03-FIXTURES` | catálogos aprobados y casos ejecutables verdes |
| `GAR-04-VALIDATOR` | versión reproducible, read-only y offline |
| `GAR-05-CI` | integración, permissions y SHA verificados |
| `GAR-06-AUTHORITY` | reviewers/capabilities vigentes y segregados |
| `GAR-07-SECURITY` | cero findings no exceptuables |
| `GAR-08-DETERMINISM` | dos runs equivalentes producen mismo resultado |
| `GAR-09-ROLLBACK` | rollback ensayado sobre fixture/canary |
| `GAR-10-OBSERVABILITY` | outputs/artifacts/retention sin datos sensibles |
| `GAR-11-CHANGE` | diff desde mode/config activos revisado |
| `GAR-12-REVIEW` | DOC-REV sobre hashes/commit exactos |

`FAIL`, `INCONCLUSIVE`, `UNKNOWN`, evidence ausente o stale bloquean.

## Requisitos por modo

### `SHADOW`

- validator y fixtures materializados/verdes;
- CI con permisos mínimos, read-only y sin required gate;
- baseline sólo informativa o ausente;
- outcomes no bloquean merge;
- métricas de falsos positivos, duración y estabilidad.

### `RATCHET_REQUIRED`

Además:

- baseline repository y `SDBL/SDBS` aprobados;
- baseline `ACTIVE` sobre scan completo congelado;
- authority registry activo con reviewers requeridos;
- debt policy aprobada, `exception.enabled: false`;
- check requerido distingue deuda histórica de findings nuevos;
- rollback vuelve a shadow sin modificar baseline.

### `STRICT`

Además:

- accepted historical count igual a cero;
- no baseline entries activas;
- validation errors/warnings sujetos a policy estricta aprobada;
- removal del baseline verificada mediante successor/history;
- branch protection/check authority confirmada.

### `EXCEPTIONS_ENABLED`

Es una capacidad adicional sobre `RATCHET_REQUIRED` o `STRICT`, no un reemplazo:

- `SDEX/SDBP/OWNA/OWNR` materializados y verdes;
- policy efectiva habilita exceptions explícitamente;
- authority matrix/relations completas;
- repository de requests/evidence aprobado;
- consumo/revocación/expiry probados end-to-end en fixtures;
- cero requests reales precargadas para “probar” activación.

## Orden permitido

```text
NOT_CONFIGURED → SHADOW → RATCHET_REQUIRED → STRICT
                         └───────────────→ EXCEPTIONS_ENABLED capability
```

- No se saltean modos.
- Volver a un modo menor requiere activation de rollback revisada.
- `EXCEPTIONS_ENABLED` puede deshabilitarse sin bajar el enforcement principal.
- Cambiar config/hash dentro de un modo crea nueva activation.
- La aprobación no aplica automáticamente; `APPROVED → APPLIED → VERIFIED` son pasos separados.

## Evidence

Cada gate registra:

```yaml
gateId: GAR-NN-<name>
outcome: PASS | FAIL | INCONCLUSIVE | NOT_APPLICABLE
subjectCommit: <sha>
componentHashes: [<ID + hash>]
evidenceRefs: [<immutable refs>]
observedAt: <UTC>
observer:
  type: HUMAN | AUTOMATION
  identityOrToolRef: <ref>
```

Automation demuestra checks; humanos aceptan contracts/risk. `NOT_APPLICABLE` exige criterio
aprobado. Evidence de otro commit/hash no se reutiliza.

## Staleness

Activation se vuelve `STALE` si cambia:

- subject commit o path/hash de componente;
- validator/config/policy/baseline/registry efectivos;
- fixture catalog o expected output normativo;
- authority assignment relevante;
- CI workflow, permissions o required check;
- categoría de riesgo o finding no exceptuable;
- rollback/observability contract.

Un cambio puramente editorial fuera del scope puede conservar evidence sólo si el hash semántico
aprobado permanece y el contrato de hashing lo permite.

## Aplicación y verificación

`APPLIED` requiere:

- merge/deployment ref exacta;
- actor autorizado;
- before/after mode y hashes;
- resultado de operación;
- ningún write fuera del changeset autorizado.

`VERIFIED` requiere:

- check observado sobre el commit aplicado;
- canaries positivos/negativos correctos;
- permisos y artifacts confirmados;
- rollback aún disponible;
- cero drift entre manifest y entorno efectivo.

No se deriva `VERIFIED` del merge exitoso.

## Rollback

El manifest incluye:

```yaml
rollback:
  targetMode: <mode anterior>
  targetActivationId: <ID>
  triggers: [<condiciones>]
  authorizedActors: [<OWN refs>]
  maximumDecisionTime: <duration>
  evidenceRef: <ensayo>
```

Rollback:

- no borra history/evidence;
- no actualiza baseline para ocultar failures;
- no deshabilita seguridad no exceptuable;
- registra nueva activation `ROLLED_BACK`;
- requiere review posterior si se ejecuta por emergencia.

## Fail-closed y degradación

- Config/schema/hash inválido: no activar.
- Provider/authority desconocido: no activar.
- Fixture o canary inestable: no activar.
- Branch protection no verificable: `UNKNOWN`, no asumir enforcement.
- Outage del validator en required mode sigue el
  [contrato de disponibilidad](validation-availability-continuity-contract.md); no existe bypass
  implícito.
- Shadow puede continuar reportando, pero no se presenta como enforcement.

## Códigos

| Código | Condición |
| --- | --- |
| `GACT001` | activation ID/schema/status/target mode inválido |
| `GACT002` | componente requerido ausente, duplicado, stale o hash mismatch |
| `GACT003` | gate outcome/evidence incompleto o inconsistente |
| `GACT004` | transición/orden de modos inválido |
| `GACT005` | contracts/fixtures/validator/CI no ready |
| `GACT006` | authority/review/segregación insuficiente |
| `GACT007` | baseline/policy/registry/exceptions incompatibles |
| `GACT008` | aplicación/verificación/drift inválido |
| `GACT009` | rollback ausente, inseguro o no reproducible |
| `GACT010` | finding no exceptuable o bypass/degradación indebida |
| `GACT011` | evidence/artifact contiene datos sensibles o acceso indebido |
| `GACT012` | resolución/orden/reporte no determinista |

## Estado actual

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
currentMode: NOT_CONFIGURED
activationManifestsCreated: 0
approvedActivations: 0
appliedActivations: 0
verifiedActivations: 0
exceptionsEnabled: false
```

## Criterios de salida

- [x] Manifest, componentes y gates comunes especificados.
- [x] Requisitos por modo y orden de transición especificados.
- [x] Evidence, staleness, aplicación, verificación y rollback especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `GACT`.
- [ ] Aprobar contract/gates/availability policy.
- [ ] Crear primera activation sólo después de materializar prerequisites.
