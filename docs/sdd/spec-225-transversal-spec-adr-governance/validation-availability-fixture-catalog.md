# Catálogo de fixtures VAVL v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[contrato de disponibilidad y continuidad](validation-availability-continuity-contract.md), sin
configurar timeouts, retries, alertas, checks ni rollback.

## Envelope

```yaml
id: VAVL-FIX-NNN
kind: POSITIVE | NEGATIVE
input:
  mode: <mode>
  policy: <policy sintética>
  attempts: [<intentos sintéticos>]
  subject: <commit/config/baseline/registry refs>
  clock: <UTC y monotonic clock congelados>
expected:
  valid: <bool>
  outcome: <VALIDATION_*>
  code: <VAVL001..VAVL012|null>
  blocksMerge: <bool>
  writes: 0
  networkRequests: 0
```

Los tiempos, hashes, runs y fallas son simulados. Ningún caso ejecuta CI, espera timeouts reales ni
contacta providers.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `VAVL-FIX-001` | Run completo sin findings | `VALIDATION_PASSED` |
| `VAVL-FIX-002` | Run completo con incumplimiento normativo | `VALIDATION_FAILED` |
| `VAVL-FIX-003` | Crash interno antes de outcome confiable | `VALIDATION_UNAVAILABLE` |
| `VAVL-FIX-004` | Run superseded por commit nuevo | `VALIDATION_CANCELLED` |
| `VAVL-FIX-005` | Resultado completo para SHA anterior | `VALIDATION_STALE` |
| `VAVL-FIX-006` | Unavailable en shadow | no bloquea, etiqueta `NOT_ENFORCED` |
| `VAVL-FIX-007` | Unavailable en ratchet/strict | bloquea merge |
| `VAVL-FIX-008` | Error transitorio recupera en retry permitido | pass con attempt chain completa |
| `VAVL-FIX-009` | Retries agotados | unavailable |
| `VAVL-FIX-010` | Rollback formal a activation verificada | modo menor explícito |
| `VAVL-FIX-011` | Dos runs de recovery deterministas | recuperación elegible |
| `VAVL-FIX-012` | Evaluación offline/read-only | cero writes y red |

## Policy y clasificación

| ID | Mutación | Código |
| --- | --- | --- |
| `VAVL-FIX-013` | Policy ID/schema/mode/outcome inválido | `VAVL001` |
| `VAVL-FIX-014` | Dos policies efectivas o policy parcial | `VAVL001` |
| `VAVL-FIX-015` | Valores propuestos se usan como efectivos | `VAVL001` |
| `VAVL-FIX-016` | Finding normativo se clasifica unavailable | `VAVL002` |
| `VAVL-FIX-017` | Crash/output corrupto se clasifica failed/pass | `VAVL002` |
| `VAVL-FIX-018` | Config inválida se considera subject failure | `VAVL002` |
| `VAVL-FIX-019` | Security failure se retryea hasta pasar | `VAVL002` |
| `VAVL-FIX-020` | Exit code aislado decide clasificación | `VAVL002` |

## Subject y budgets

| ID | Mutación | Código |
| --- | --- | --- |
| `VAVL-FIX-021` | Attempt cambia commit entre retries | `VAVL003` |
| `VAVL-FIX-022` | Tool/config/baseline/registry hash cambia | `VAVL003` |
| `VAVL-FIX-023` | Resultado no declara versiones/hashes efectivos | `VAVL003` |
| `VAVL-FIX-024` | Queue y execution se mezclan para ocultar timeout | `VAVL004` |
| `VAVL-FIX-025` | Hard timeout produce pass o resultado parcial | `VAVL004` |
| `VAVL-FIX-026` | Soft timeout termina prematuramente como success | `VAVL004` |
| `VAVL-FIX-027` | Wall clock no monotónico mide duración | `VAVL004` |
| `VAVL-FIX-028` | Budget aumenta sin nueva policy/review | `VAVL004` |

## Retries y fuente autoritativa

| ID | Mutación | Código |
| --- | --- | --- |
| `VAVL-FIX-029` | Findings/config error se retryean buscando pass | `VAVL005` |
| `VAVL-FIX-030` | Retry excede máximo o carece de backoff registrado | `VAVL005` |
| `VAVL-FIX-031` | Pass posterior borra intentos fallidos | `VAVL005` |
| `VAVL-FIX-032` | Rerun manual reemplaza evidence anterior | `VAVL005` |
| `VAVL-FIX-033` | Run de otro commit/branch satisface gate | `VAVL006` |
| `VAVL-FIX-034` | Resultado local del autor satisface gate | `VAVL006` |
| `VAVL-FIX-035` | Cache/artifact/último pass conocido sustituye run | `VAVL006` |
| `VAVL-FIX-036` | Run stale/cancelled satisface gate | `VAVL006` |

## Degradación, rollback y recovery

| ID | Mutación | Código |
| --- | --- | --- |
| `VAVL-FIX-037` | Unavailable en required se convierte en success | `VAVL007` |
| `VAVL-FIX-038` | Label/comment/env habilita bypass | `VAVL007` |
| `VAVL-FIX-039` | Rollback implícito se presenta como pass | `VAVL007` |
| `VAVL-FIX-040` | Excepción se consume durante unavailable | `VAVL007` |
| `VAVL-FIX-041` | Rollback usa target no verificado | `VAVL008` |
| `VAVL-FIX-042` | Actor sin capability ejecuta rollback | `VAVL008` |
| `VAVL-FIX-043` | Rollback borra history/evidence o cambia baseline | `VAVL008` |
| `VAVL-FIX-044` | Security/tampering no contenido permite rollback operativo | `VAVL008` |
| `VAVL-FIX-045` | Un único pass declara recuperación | `VAVL009` |
| `VAVL-FIX-046` | Recovery omite fixtures/canaries/permissions | `VAVL009` |
| `VAVL-FIX-047` | Commits afectados no se revalidan | `VAVL009` |
| `VAVL-FIX-048` | Activation de recovery no alcanza VERIFIED | `VAVL009` |

## Métricas, seguridad y determinismo

| ID | Mutación | Código |
| --- | --- | --- |
| `VAVL-FIX-049` | Ventana con muestra insuficiente publica SLO cumplido | `VAVL010` |
| `VAVL-FIX-050` | Cancelled/stale se ocultan de métricas | `VAVL010` |
| `VAVL-FIX-051` | Alertar se trata como sustituto del bloqueo | `VAVL010` |
| `VAVL-FIX-052` | Métrica mezcla queue/execution o modos | `VAVL010` |
| `VAVL-FIX-053` | Artifact contiene secreto/PII/source completo | `VAVL011` |
| `VAVL-FIX-054` | Actor no autorizado accede artifacts/provider payload | `VAVL011` |
| `VAVL-FIX-055` | Retención es menor a ventana de review/incidente | `VAVL011` |
| `VAVL-FIX-056` | Attempt artifact/path usa traversal o symlink escape | `VAVL011` |
| `VAVL-FIX-057` | Clock/locale/timezone altera clasificación | `VAVL012` |
| `VAVL-FIX-058` | Jitter no acotado altera outcome reproducible | `VAVL012` |
| `VAVL-FIX-059` | Orden de attempts cambia conclusión | `VAVL012` |
| `VAVL-FIX-060` | Dos runs iguales emiten report/hash distinto | `VAVL012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `VAVL001` | 013–015 |
| `VAVL002` | 016–020 |
| `VAVL003` | 021–023 |
| `VAVL004` | 024–028 |
| `VAVL005` | 029–032 |
| `VAVL006` | 033–036 |
| `VAVL007` | 037–040 |
| `VAVL008` | 041–044 |
| `VAVL009` | 045–048 |
| `VAVL010` | 049–052 |
| `VAVL011` | 053–056 |
| `VAVL012` | 057–060 |

Cada código posee al menos tres casos negativos. Los 12 positivos fijan outcomes, comportamiento
por modo, retries, rollback, recovery y operación segura.

## Materialización futura

- Simular attempts y clocks; no usar sleeps ni jobs CI reales.
- Congelar commit, versions, hashes, policy, mode, locale y timezone.
- Inyectar fallas clasificadas y verificar attempt chain completa.
- Verificar outcome, bloqueo, diagnostics, metrics, writes y network.
- Usar canaries sintéticos para redacción de artifacts.
- La materialización no aprueba budgets/SLO ni configura rollback.

## Estado

```yaml
catalogId: VAVL-FIXTURE-CATALOG-V1
specifiedCases: 60
positiveCases: 12
negativeCases: 48
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
effectiveAvailabilityPolicy: null
observedRuns: 0
```
