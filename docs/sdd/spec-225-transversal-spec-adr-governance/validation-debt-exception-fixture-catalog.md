# Catálogo de fixtures SDEX v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[contrato de excepciones de deuda](validation-debt-exception-governance-contract.md). El catálogo
no crea solicitudes, authorities, registros ni excepciones reales.

## Envelope

```yaml
id: SDEX-FIX-NNN
kind: POSITIVE | NEGATIVE
input:
  request: <solicitud sintética>
  currentFinding: <finding sintético>
  activeBaseline: <ref sintética|null>
  clock: <UTC congelado>
expected:
  valid: <bool>
  code: <SDEX001..SDEX012|null>
  resultingStatus: <status|null>
  writes: 0
  networkRequests: 0
```

IDs, hashes, commits, assignments y secretos detectables son valores ficticios. Cada caso negativo
declara un código público primario aunque una implementación pueda emitir detalles adicionales.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `SDEX-FIX-001` | Solicitud completa entra a revisión | `UNDER_REVIEW` |
| `SDEX-FIX-002` | Finding `NEW` elegible con mitigación verificable | elegible |
| `SDEX-FIX-003` | Requester, risk owner, reviewers y maintainer separados | autoridad válida |
| `SDEX-FIX-004` | Review exacta aprueba solicitud dentro de vigencia | `APPROVED` |
| `SDEX-FIX-005` | Successor exacto consume una aprobación una vez | `CONSUMED` |
| `SDEX-FIX-006` | Solicitud es rechazada con rationale | `REJECTED`, baseline intacta |
| `SDEX-FIX-007` | Finding se remedia antes del consumo | solicitud cerrable sin entry |
| `SDEX-FIX-008` | Mitigación incumplida revoca aprobación | `REVOKED`, gate falla |
| `SDEX-FIX-009` | Renovación usa nueva ID, review y escalamiento | nueva solicitud evaluable |
| `SDEX-FIX-010` | Evidence restringida se referencia por ID/hash | válida, sin exposición |
| `SDEX-FIX-011` | Inputs permutados | misma decisión y reporte |
| `SDEX-FIX-012` | Evaluación completa en modo read-only/offline | cero writes y cero red |

## Schema e identidad

| ID | Mutación | Código |
| --- | --- | --- |
| `SDEX-FIX-013` | `schemaVersion` ausente/desconocida | `SDEX001` |
| `SDEX-FIX-014` | `exceptionId` inválida, duplicada o reutilizada | `SDEX001` |
| `SDEX-FIX-015` | status/transición/path de solicitud inválido | `SDEX001` |
| `SDEX-FIX-016` | fingerprint difiere del finding observado | `SDEX002` |
| `SDEX-FIX-017` | commit/validator/config/scope no coincide | `SDEX002` |
| `SDEX-FIX-018` | subject ID/relation/code cambia durante review | `SDEX002` |

## Elegibilidad y completitud

| ID | Mutación | Código |
| --- | --- | --- |
| `SDEX-FIX-019` | Finding es `DRIFTED`, `REAPPEARED` o histórico mal clasificado | `SDEX003` |
| `SDEX-FIX-020` | Falso positivo intenta resolverse con excepción | `SDEX003` |
| `SDEX-FIX-021` | Secret/PII, traversal, SSRF o ejecución insegura | `SDEX003` |
| `SDEX-FIX-022` | ID reutilizado, aislamiento/autorización vulnerado | `SDEX003` |
| `SDEX-FIX-023` | Corrupción de datos, evidence falsa o validator con writes/red | `SDEX003` |
| `SDEX-FIX-024` | Reason/impacto de bloqueo o riesgo residual ausente | `SDEX004` |
| `SDEX-FIX-025` | Mitigación vaga, no verificable o ya incumplida | `SDEX004` |
| `SDEX-FIX-026` | Issue, owner, expiry o removal condition ausente | `SDEX004` |

## Autoridad y review

| ID | Mutación | Código |
| --- | --- | --- |
| `SDEX-FIX-027` | Requester aprueba su propia excepción | `SDEX005` |
| `SDEX-FIX-028` | Risk owner también es único technical/policy reviewer | `SDEX005` |
| `SDEX-FIX-029` | `BLOCKER/HIGH` sin autoridad reforzada asignada | `SDEX005` |
| `SDEX-FIX-030` | Bot/CI acepta riesgo o maintainer sustituye aprobación | `SDEX005` |
| `SDEX-FIX-031` | Review refiere otro commit/fingerprint | `SDEX006` |
| `SDEX-FIX-032` | Evidence stale por cambio de config/scope/validator | `SDEX006` |
| `SDEX-FIX-033` | Decision carece de rationale, timestamp o decided commit | `SDEX006` |

## Consumo, lifecycle y successor

| ID | Mutación | Código |
| --- | --- | --- |
| `SDEX-FIX-034` | DRAFT/UNDER_REVIEW/REJECTED se consume | `SDEX007` |
| `SDEX-FIX-035` | Aprobación se consume dos veces | `SDEX007` |
| `SDEX-FIX-036` | Consumo aplica a otro fingerprint | `SDEX007` |
| `SDEX-FIX-037` | Misma propuesta introduce finding y se autoaprueba | `SDEX007` |
| `SDEX-FIX-038` | Excepción vencida permanece consumible/aceptada | `SDEX008` |
| `SDEX-FIX-039` | Renovación edita solicitud anterior | `SDEX008` |
| `SDEX-FIX-040` | Revocación no invalida aceptación inmediatamente | `SDEX008` |
| `SDEX-FIX-041` | Successor omite exception/review/hash refs | `SDEX009` |
| `SDEX-FIX-042` | Successor aumenta deuda distinta a la aprobada | `SDEX009` |
| `SDEX-FIX-043` | Successor modifica/elimina historia previa | `SDEX009` |

## Anti-normalización, seguridad y determinismo

| ID | Mutación | Código |
| --- | --- | --- |
| `SDEX-FIX-044` | Excepción previa se usa como aprobación automática | `SDEX010` |
| `SDEX-FIX-045` | Policy ofrece cupo genérico de N findings | `SDEX010` |
| `SDEX-FIX-046` | Excepción eleva severity ceiling global | `SDEX010` |
| `SDEX-FIX-047` | Renovaciones repetidas omiten escalamiento | `SDEX010` |
| `SDEX-FIX-048` | Request/evidence contiene secreto o PII sintético | `SDEX011` |
| `SDEX-FIX-049` | Path absoluto, traversal o symlink escape | `SDEX011` |
| `SDEX-FIX-050` | Actor no autorizado lee evidence restringida | `SDEX011` |
| `SDEX-FIX-051` | Orden, locale o timezone altera evaluación | `SDEX012` |
| `SDEX-FIX-052` | Reloj no congelado cambia expiry durante el run | `SDEX012` |
| `SDEX-FIX-053` | Dos scans iguales emiten orden/hash distinto | `SDEX012` |
| `SDEX-FIX-054` | Selección depende del archivo/ID “más nuevo” | `SDEX012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `SDEX001` | 013–015 |
| `SDEX002` | 016–018 |
| `SDEX003` | 019–023 |
| `SDEX004` | 024–026 |
| `SDEX005` | 027–030 |
| `SDEX006` | 031–033 |
| `SDEX007` | 034–037 |
| `SDEX008` | 038–040 |
| `SDEX009` | 041–043 |
| `SDEX010` | 044–047 |
| `SDEX011` | 048–050 |
| `SDEX012` | 051–054 |

Cada código posee al menos tres casos negativos. Los casos 001–012 fijan comportamiento positivo y
evitan que una implementación conforme sea un rechazo universal.

## Materialización futura

- Usar repositorios, identities y assignments totalmente sintéticos.
- Congelar commit, config, scope, validator, clock, locale y timezone.
- Simular roles separados; no reutilizar identidad para simplificar casos.
- Verificar decision, transición, diagnostics, writes, network y successor refs.
- Casos sensibles deben usar detectores canary, nunca secretos reales.
- Ningún fixture puede registrar, aprobar o consumir una excepción real.

## Estado

```yaml
catalogId: SDEX-FIXTURE-CATALOG-V1
specifiedCases: 54
positiveCases: 12
negativeCases: 42
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
exceptionRequestsCreated: 0
exceptionsApproved: 0
```
