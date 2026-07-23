# Contrato de integración CI para validación SDD — SPEC-225

## Propósito

Definir cómo `npm run sdd:validate` se ejecutará en pull requests/main y cómo su outcome alimentará
el check agregador. Este contrato no crea workflow, script, branch protection ni runner.

## Estado

```yaml
sddCi:
  status: NOT_CONFIGURED
  workflowPath: NOT_CREATED
  rootScript: NOT_IMPLEMENTED
  checkName: sdd-static
  aggregatorCheck: ci-required
  rolloutMode: NOT_STARTED
  branchProtection: UNASSESSED
  owner: UNASSIGNED
  reviewers: [UNASSIGNED]
```

Los nombres son interfaz propuesta, no checks existentes.

## Eventos

```yaml
events:
  pull_request:
    enabled: true
    trust: UNTRUSTED_SAFE
  push:
    branches: [main]
  merge_group:
    enabled: WHEN_PROVIDER_SUPPORT_CONFIRMED
  workflow_dispatch:
    enabled: true
  schedule:
    enabled: false
```

El auditor XURL usa workflow programado separado. `sdd-static` no recibe red runtime ni valida
disponibilidad externa.

## Scope por evento

- Todo PR ejecuta el gate: una modificación de código puede dejar referencias/evidence stale.
- Push a main verifica el commit integrado y genera evidence durable.
- Merge queue ejecuta el SHA sintético cuando se adopte esa capacidad.
- Dispatch sirve para diagnóstico sobre ref explícita; no sustituye required check.
- Path filters no omiten `sdd-static`.

Una futura optimización incremental debe demostrar equivalencia con scan completo mediante fixtures
y mantener scan completo en main/schedule.

## Trust y permisos

```yaml
permissions:
  contents: read
  pullRequests: read
  actions: none
  checks: none
  idToken: none
  packages: read-only-if-required
secrets: []
writeToken: false
```

- PRs de forks usan el mismo validator sin secretos.
- No se ejecuta código mutable del comentario/label.
- El checkout usa commit/ref exacto, sin persistir credentials.
- La etapa validator no accede a red.
- La instalación, si descarga dependencias bloqueadas, ocurre en etapa separada con lockfile y
  egress de registry; no habilita red al proceso de validación.
- Caches son contenido direccionado por runtime/lockfile y no contienen secrets.

## Runtime y reproducibilidad

El job registra:

```yaml
runtime:
  node: <versión exacta>
  npm: <versión exacta>
  lockfileHash: sha256:<hex>
  validatorVersion: <commit/package exacto>
  configHash: sha256:<hex>
  baselineHash: sha256:<hex>
  fixtureCatalogRevision: <ref>
```

No se usa `latest`, ranges no bloqueados ni action mutable por tag sin digest/SHA policy aprobada.

## Fases del job

```text
CHECKOUT → INSTALL/RESTORE VERIFIED CACHE → STATIC SECURITY CHECK →
RUN VALIDATOR READ-ONLY → VERIFY ZERO WRITES → PUBLISH SANITIZED REPORT →
EMIT CHECK OUTCOME
```

El control de cero escrituras compara estado/snapshot antes/después. Detectar una escritura falla
aunque el contenido generado sea correcto.

## Rollout

La promoción entre modos requiere una activation conforme al
[contrato de readiness de gobernanza](governance-activation-readiness-contract.md); aprobar este
contrato de CI por sí solo no habilita un modo.

Timeouts, crashes, retries, unavailable outcomes y rollback siguen el
[contrato de disponibilidad](validation-availability-continuity-contract.md).

### `SHADOW_AUDIT`

- ejecuta y publica findings;
- no forma parte de branch protection;
- no marca deuda legacy como success silencioso;
- mide duración, falsos positivos y baseline;
- todo crash/infra error es visible.

### `RATCHET_REQUIRED`

- check requerido;
- deuda baseline vigente puede persistir;
- findings nuevos, baseline growth, writes, schema/config error fallan;
- reducción pasa;
- `BLOCKED/INFRA_ERROR` no produce PASS.

### `STRICT_REQUIRED`

- baseline de errores es cero;
- cualquier error falla;
- warnings siguen policy explícita;
- branch protection exige aggregator para SHA candidato.

Transiciones requieren DOC-REV, canarios y evidencia. No se salta de `NOT_STARTED` a strict por
declaración.

## Outcomes

```text
PASS | FAIL | BLOCKED | INFRA_ERROR | CANCELLED | NOT_APPLICABLE
```

- `PASS`: validator terminó y policy del rollout se satisface.
- `FAIL`: finding/regresión/escritura determinista.
- `BLOCKED`: prerequisite/config/authority impide evaluar.
- `INFRA_ERROR`: checkout/install/runner/artifact failure.
- `CANCELLED`: run obsoleto; no satisface candidate SHA.
- `NOT_APPLICABLE`: reservado a jobs secundarios; `sdd-static` de PR nunca lo usa.

En modo required, sólo `PASS` satisface aggregator.

## Aggregator

`ci-required` recibe records:

```yaml
gate:
  name: sdd-static
  requiredForCommit: true
  subjectCommit: <sha>
  runAttempt: <entero>
  outcome: <enum>
  reportHash: sha256:<hex>
```

- El aggregator no convierte missing/cancelled/blocked en PASS.
- Sólo acepta outcome del mismo SHA.
- Re-run exitoso puede reemplazar intento fallido sólo conservando historia.
- Omitir gate por filter requiere record explícito; para SDD no se permite en PR.

## Concurrency

- group por workflow + PR/ref;
- nuevo commit cancela runs obsoletos de esa rama;
- no cancela el último run del candidate SHA;
- merge_group no comparte group con branch PR;
- cancellation se registra separada de failure;
- un re-run usa mismos inputs/config o evidencia nuevo hash.

## Outputs

Artifacts lógicos:

```text
sdd-report.json
sdd-console.txt
sdd-baseline-diff.json
sdd-run-metadata.json
```

Requisitos:

- JSON schema versionado;
- findings ordenados;
- paths relativos;
- cero contenido completo innecesario;
- redacción de secrets/PII;
- report hash en check;
- retención mínima aprobada;
- artifact failure produce `INFRA_ERROR` si report es obligatorio.

No se publican comentarios masivos en PR; annotations se acotan/agregan para evitar spam.

## Baseline y ratchet

El job consume baseline versionada sobre el mismo commit.

- no genera/actualiza baseline;
- no acepta baseline desde artifact de run previo;
- verifica scope/config hash;
- identifica findings por semántica, no línea;
- reporta added/resolved/unchanged/drift;
- rechaza excepciones vencidas o sin owner/issue;
- una PR no puede agregar su propio finding al baseline y pasar sin proceso de excepción aprobado.
- toda excepción consumida debe satisfacer
  `validation-debt-exception-governance-contract.md`; CI sólo verifica, nunca acepta riesgo.

## Canarios

Antes de `RATCHET_REQUIRED`, ejercicio revisado demuestra:

1. spec ID duplicado falla;
2. link roto falla;
3. lifecycle incompatible falla;
4. ADR inválido falla;
5. baseline growth falla;
6. reducción pasa;
7. validator que escribe falla;
8. intento de red falla;
9. infra error no pasa aggregator;
10. run de SHA anterior no satisface candidate SHA.

Los canarios son fixtures/cambios temporales controlados y se retiran en el mismo ejercicio.

## Budget y operación

Antes de hacerlo required se mide:

```yaml
budget:
  maxDuration: NOT_MEASURED
  maxArtifactBytes: NOT_MEASURED
  maxCacheBytes: NOT_MEASURED
  runnerMinutesBaseline: NOT_MEASURED
  owner: UNASSIGNED
```

Timeouts y límites se fijan tras medición/SPK-05. Un timeout demasiado bajo no se usa para convertir
gate en flaky/optional.

## Failure handling

- Validator defectuoso: `BLOCKED` o `FAIL` según causa, nunca skip silencioso.
- Provider outage: `INFRA_ERROR`; required check queda no satisfecho.
- Falso positivo: finding/repro/fixture + fix del validator; no blanket ignore.
- Rollback workflow: volver a versión conocida y mantener evidencia; no desactivar branch gate sin
  emergency change record.
- Emergencia sigue SPEC-221; la terminal condition no autoriza bypass no registrado.

## Baseline actual

```yaml
baselineId: SDDCI-BASE-001
status: OBSERVED_NOT_FROZEN
githubDirectoryPresent: false
workflowPresent: false
rootSddValidateScriptPresent: false
validatorImplemented: false
materializedIntegratedFixtures: 0
requiredCheckObserved: false
branchProtection: UNASSESSED
rolloutMode: NOT_STARTED
networkIsolationVerified: false
canariesExecuted: 0
```

No se consultó configuración remota del proveedor; `requiredCheckObserved: false` describe
evidencia versionada local, no prueba universal de settings externos.

## Códigos

| Código | Condición |
| --- | --- |
| `SDDCI001` | workflow/job/event/check schema inválido |
| `SDDCI002` | permissions, trust o secret policy insegura |
| `SDDCI003` | runtime/action/dependency mutable o no reproducible |
| `SDDCI004` | subject SHA/checkout/config/baseline mismatch |
| `SDDCI005` | outcome/exit/annotation/report inconsistente |
| `SDDCI006` | validator escribió o intentó red |
| `SDDCI007` | baseline/ratchet/excepción inválido |
| `SDDCI008` | aggregator/filter/missing/cancelled gate tratado incorrectamente |
| `SDDCI009` | concurrency/re-run/merge-group incorrecto |
| `SDDCI010` | artifact/cache/log sensible, stale o incompleto |
| `SDDCI011` | rollout/canary/branch protection prematuro o no probado |
| `SDDCI012` | budget/timeout/infra/rollback sin policy o no determinista |

## Criterios de salida

- [x] Eventos, trust, permisos y runtime especificados.
- [x] Rollout, outcomes, aggregator y concurrency especificados.
- [x] Outputs, ratchet, canarios, budget y failure handling especificados.
- [x] Baseline local sin integración relevado.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `SDDCI`.
- [ ] Aprobar workflow/policy/rollout.
- [ ] Implementar script/validator antes del workflow required.
- [ ] Ejecutar canarios y habilitar ratchet.

Los últimos tres checks permanecen abiertos. Los casos normativos están definidos en
`sdd-validation-ci-fixture-catalog.md`; no existe integración CI.
