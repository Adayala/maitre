# Catálogo de fixtures GACT v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[readiness de activación de gobernanza](governance-activation-readiness-contract.md), sin crear
manifests ni cambiar el modo efectivo.

## Envelope

```yaml
id: GACT-FIX-NNN
kind: POSITIVE | NEGATIVE
input:
  currentMode: <mode>
  activation: <manifest sintético>
  components: [<artifacts sintéticos>]
  gateEvidence: [<evidence sintética>]
  clock: <UTC congelado>
expected:
  valid: <bool>
  code: <GACT001..GACT012|null>
  resultingStatus: <status|null>
  resultingMode: <mode sin mutar o esperado simulado>
  writes: 0
  networkRequests: 0
```

IDs, hashes, commits, actors y evidence son ficticios. Los casos simulan decisiones; nunca modifican
CI, branch protection, baselines o registros reales.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `GACT-FIX-001` | Manifest DRAFT completo para shadow | válido, no aplicado |
| `GACT-FIX-002` | `NOT_CONFIGURED → SHADOW` con gates requeridos PASS | `APPROVED` |
| `GACT-FIX-003` | Shadow aplicado y canaries verificados | `VERIFIED`, modo shadow |
| `GACT-FIX-004` | `SHADOW → RATCHET_REQUIRED` con baseline/registry activos | aprobado |
| `GACT-FIX-005` | Ratchet verificado con exceptions deshabilitadas | `VERIFIED` |
| `GACT-FIX-006` | `RATCHET_REQUIRED → STRICT` con deuda activa cero | aprobado |
| `GACT-FIX-007` | Exceptions se habilita sobre ratchet con prerequisites completos | capability habilitable |
| `GACT-FIX-008` | Exceptions se deshabilita sin bajar enforcement | ratchet permanece |
| `GACT-FIX-009` | Cambio de config crea nueva activation del mismo modo | válido |
| `GACT-FIX-010` | Rollback revisado vuelve al modo anterior | history preservada |
| `GACT-FIX-011` | Component/input order permutado | mismo readiness report |
| `GACT-FIX-012` | Evaluación offline/read-only | cero writes y red |

## Manifest y componentes

| ID | Mutación | Código |
| --- | --- | --- |
| `GACT-FIX-013` | ID/schema/status/target mode inválido | `GACT001` |
| `GACT-FIX-014` | Status transition no pertenece al lifecycle | `GACT001` |
| `GACT-FIX-015` | Manifest representa múltiples target modes | `GACT001` |
| `GACT-FIX-016` | Componente requerido se omite sin `NOT_APPLICABLE` | `GACT002` |
| `GACT-FIX-017` | Componente duplicado o con path/hash mismatch | `GACT002` |
| `GACT-FIX-018` | Fixture catalog/evidence pertenece a otra versión | `GACT002` |
| `GACT-FIX-019` | Componente cambia después del review | `GACT002` |

## Gates y transiciones

| ID | Mutación | Código |
| --- | --- | --- |
| `GACT-FIX-020` | Gate requerido ausente | `GACT003` |
| `GACT-FIX-021` | `FAIL/INCONCLUSIVE/UNKNOWN` se trata como PASS | `GACT003` |
| `GACT-FIX-022` | `NOT_APPLICABLE` carece de razón normativa | `GACT003` |
| `GACT-FIX-023` | Evidence refiere otro commit/component hash | `GACT003` |
| `GACT-FIX-024` | `NOT_CONFIGURED → RATCHET_REQUIRED` saltea shadow | `GACT004` |
| `GACT-FIX-025` | `SHADOW → STRICT` saltea ratchet | `GACT004` |
| `GACT-FIX-026` | `APPROVED` se marca directamente `VERIFIED` | `GACT004` |
| `GACT-FIX-027` | Downgrade ocurre sin activation de rollback | `GACT004` |

## Readiness y autoridad

| ID | Mutación | Código |
| --- | --- | --- |
| `GACT-FIX-028` | Contracts/fixtures no aprobados o no materializados | `GACT005` |
| `GACT-FIX-029` | Validator no reproducible, escribe o requiere red | `GACT005` |
| `GACT-FIX-030` | CI permissions/SHA/canaries no verificados | `GACT005` |
| `GACT-FIX-031` | Branch protection desconocida se asume required | `GACT005` |
| `GACT-FIX-032` | Reviewer assignment ausente/expirado | `GACT006` |
| `GACT-FIX-033` | Actor carece de capability/tier | `GACT006` |
| `GACT-FIX-034` | Autor se autoaprueba o cardinalidad insuficiente | `GACT006` |
| `GACT-FIX-035` | Registry/provider authority está `UNKNOWN` | `GACT006` |

## Compatibilidad y aplicación

| ID | Mutación | Código |
| --- | --- | --- |
| `GACT-FIX-036` | Ratchet activa sin baseline/registry compatibles | `GACT007` |
| `GACT-FIX-037` | Strict conserva accepted entries activas | `GACT007` |
| `GACT-FIX-038` | Exceptions se habilita con policy `enabled: false` | `GACT007` |
| `GACT-FIX-039` | Policy/baseline/registry hashes pertenecen a commits distintos | `GACT007` |
| `GACT-FIX-040` | APPLIED carece de merge/deploy ref y before/after | `GACT008` |
| `GACT-FIX-041` | VERIFIED se deriva sólo del merge exitoso | `GACT008` |
| `GACT-FIX-042` | Canaries/permissions/artifacts efectivos divergen | `GACT008` |
| `GACT-FIX-043` | Drift posterior no vuelve activation stale | `GACT008` |

## Rollback, seguridad y fail-closed

| ID | Mutación | Código |
| --- | --- | --- |
| `GACT-FIX-044` | Rollback target/trigger/actor/evidence ausente | `GACT009` |
| `GACT-FIX-045` | Rollback borra history/evidence | `GACT009` |
| `GACT-FIX-046` | Rollback actualiza baseline para ocultar findings | `GACT009` |
| `GACT-FIX-047` | Rollback deshabilita controles no exceptuables | `GACT009` |
| `GACT-FIX-048` | Finding no exceptuable permite activación | `GACT010` |
| `GACT-FIX-049` | Outage/config error activa bypass implícito | `GACT010` |
| `GACT-FIX-050` | Shadow se reporta como enforcement | `GACT010` |
| `GACT-FIX-051` | Label/env/comment altera gates o mode | `GACT010` |
| `GACT-FIX-052` | Evidence/artifact contiene secret/PII/source sensible | `GACT011` |
| `GACT-FIX-053` | Actor no autorizado accede artifacts restringidos | `GACT011` |
| `GACT-FIX-054` | Path/symlink de component/evidence escapa del root | `GACT011` |

## Determinismo

| ID | Mutación | Código |
| --- | --- | --- |
| `GACT-FIX-055` | Orden de components/gates altera outcome | `GACT012` |
| `GACT-FIX-056` | Clock/locale/timezone altera readiness | `GACT012` |
| `GACT-FIX-057` | Dos runs equivalentes emiten hashes/orden distinto | `GACT012` |
| `GACT-FIX-058` | “Última config” se selecciona por mtime/filename | `GACT012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `GACT001` | 013–015 |
| `GACT002` | 016–019 |
| `GACT003` | 020–023 |
| `GACT004` | 024–027 |
| `GACT005` | 028–031 |
| `GACT006` | 032–035 |
| `GACT007` | 036–039 |
| `GACT008` | 040–043 |
| `GACT009` | 044–047 |
| `GACT010` | 048–051 |
| `GACT011` | 052–054 |
| `GACT012` | 055–058 |

Cada código posee al menos tres casos negativos. Los 12 positivos fijan transiciones válidas,
aplicación/verificación separadas, rollback y operación segura.

## Materialización futura

- Usar components, workflows, registries y baselines completamente sintéticos.
- Congelar commit, hashes, clock, locale, timezone y current mode.
- Simular branch protection/provider; no consultar sistemas externos.
- Verificar status/mode simulado, gates, codes, writes y network.
- Ensayar rollback sólo dentro del árbol fixture.
- La materialización no crea una activation ni cambia CI.

## Estado

```yaml
catalogId: GACT-FIXTURE-CATALOG-V1
specifiedCases: 58
positiveCases: 12
negativeCases: 46
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
activationManifestsCreated: 0
currentMode: NOT_CONFIGURED
```
