# Catálogo de fixtures VINC v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[contrato de respuesta a incidentes](validation-incident-response-contract.md), sin crear incidentes,
alertas, assignments ni canales de comunicación.

## Envelope

```yaml
id: VINC-FIX-NNN
kind: POSITIVE | NEGATIVE
input:
  incident: <record sintético>
  events: [<timeline sintética>]
  evidence: [<artifacts sintéticos>]
  assignments: [<OWN refs sintéticas>]
  clock: <UTC congelado>
expected:
  valid: <bool>
  code: <VINC001..VINC012|null>
  resultingStatus: <status|null>
  writes: 0
  networkRequests: 0
```

Los casos usan identidades, commits, channels, artifacts y canaries ficticios. No contienen PII,
credenciales ni incidentes reales.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `VINC-FIX-001` | Detección completa crea record `DETECTED` | válida |
| `VINC-FIX-002` | Sospecha de tampering se clasifica inicialmente `SEV1` | triage conservador |
| `VINC-FIX-003` | Roles separados y vigentes toman el incidente | `TRIAGED` |
| `VINC-FIX-004` | Bypass detenido y evidence preservada | `CONTAINED` |
| `VINC-FIX-005` | Recovery plan usa activation verificada | `RECOVERING` |
| `VINC-FIX-006` | Control restaurado y backlog revalidado | `RESOLVED` |
| `VINC-FIX-007` | Root cause/actions/review completos | `CLOSED` |
| `VINC-FIX-008` | Nueva evidencia invalida cierre | `REOPENED` |
| `VINC-FIX-009` | Artifact restringido se referencia por ID/hash | válido |
| `VINC-FIX-010` | Redacción crea derivado con parent | original preservado |
| `VINC-FIX-011` | Eventos permutados se ordenan por secuencia normativa | mismo timeline |
| `VINC-FIX-012` | Evaluación offline/read-only | cero writes y red |

## Record, detección y clasificación

| ID | Mutación | Código |
| --- | --- | --- |
| `VINC-FIX-013` | Incident ID/schema/status/type inválido | `VINC001` |
| `VINC-FIX-014` | Severity fuera del enum o ausente | `VINC001` |
| `VINC-FIX-015` | Múltiples records reutilizan la misma ID | `VINC001` |
| `VINC-FIX-016` | Finding normal se declara incidente sin control gap | `VINC002` |
| `VINC-FIX-017` | Fail-open/tampering probable se clasifica `SEV3` | `VINC002` |
| `VINC-FIX-018` | Severity elige criterio inferior aplicable | `VINC002` |
| `VINC-FIX-019` | Affected commits/components/impact se omiten | `VINC002` |

## Ownership, lifecycle y comunicación

| ID | Mutación | Código |
| --- | --- | --- |
| `VINC-FIX-020` | Incident commander assignment ausente/expirado | `VINC003` |
| `VINC-FIX-021` | Bot comanda/cierra incidente | `VINC003` |
| `VINC-FIX-022` | Sospecha privacy/security sin owner especializado | `VINC003` |
| `VINC-FIX-023` | Falta de roles no escala y permite avance | `VINC003` |
| `VINC-FIX-024` | Se saltea `TRIAGED` o `CONTAINED` | `VINC004` |
| `VINC-FIX-025` | `RESOLVED` se trata como `CLOSED` | `VINC004` |
| `VINC-FIX-026` | Timeline tiene eventos sin timestamp/actor/sequence | `VINC004` |
| `VINC-FIX-027` | Cadencia aprobada se incumple sin registro | `VINC004` |
| `VINC-FIX-028` | Update oculta estado/impacto/próxima comunicación | `VINC006` |
| `VINC-FIX-029` | Hipótesis se comunica como hecho | `VINC006` |
| `VINC-FIX-030` | Notificación legal/privacy se emite sin autoridad | `VINC006` |

## Contención y evidence

| ID | Mutación | Código |
| --- | --- | --- |
| `VINC-FIX-031` | Containment edita/borrar history/evidence | `VINC005` |
| `VINC-FIX-032` | Baseline se actualiza para ocultar findings | `VINC005` |
| `VINC-FIX-033` | Check se marca passed manualmente | `VINC005` |
| `VINC-FIX-034` | Reactivación ocurre antes de recovery gates | `VINC005` |
| `VINC-FIX-035` | Evidence carece de source/capture/hash | `VINC007` |
| `VINC-FIX-036` | Artifact derivado no enlaza parents | `VINC007` |
| `VINC-FIX-037` | Redacción sobrescribe original | `VINC007` |
| `VINC-FIX-038` | Evidence restringida carece de retention/access trail | `VINC007` |

## Recovery, causa y cierre

| ID | Mutación | Código |
| --- | --- | --- |
| `VINC-FIX-039` | Recovery omite vector contenido o hashes aprobados | `VINC008` |
| `VINC-FIX-040` | Fixtures no incluyen regresión del incidente | `VINC008` |
| `VINC-FIX-041` | Un run exitoso sustituye dos runs deterministas | `VINC008` |
| `VINC-FIX-042` | Commits afectados no se revalidan | `VINC008` |
| `VINC-FIX-043` | “Error humano” es única root cause | `VINC009` |
| `VINC-FIX-044` | Root cause mezcla hechos e hipótesis sin evidence | `VINC009` |
| `VINC-FIX-045` | Corrective action carece de owner/condición/verificación | `VINC009` |
| `VINC-FIX-046` | Acción no verificada se marca completa | `VINC009` |
| `VINC-FIX-047` | Cierre omite recovery verified o closure review | `VINC010` |
| `VINC-FIX-048` | Riesgo residual carece de aceptación competente | `VINC010` |
| `VINC-FIX-049` | Recurrencia no reabre el incidente | `VINC010` |
| `VINC-FIX-050` | Evidence stale sostiene cierre | `VINC010` |

## Seguridad y determinismo

| ID | Mutación | Código |
| --- | --- | --- |
| `VINC-FIX-051` | Record/update contiene secret o PII sintético | `VINC011` |
| `VINC-FIX-052` | Artifact/path usa traversal o symlink escape | `VINC011` |
| `VINC-FIX-053` | Actor no autorizado accede evidence restringida | `VINC011` |
| `VINC-FIX-054` | Payload provider/source completo se publica | `VINC011` |
| `VINC-FIX-055` | Orden de input altera timeline/outcome | `VINC012` |
| `VINC-FIX-056` | Locale/timezone altera severity/cadencia | `VINC012` |
| `VINC-FIX-057` | Clock cambia durante evaluación | `VINC012` |
| `VINC-FIX-058` | Dos runs iguales emiten report/hash distinto | `VINC012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `VINC001` | 013–015 |
| `VINC002` | 016–019 |
| `VINC003` | 020–023 |
| `VINC004` | 024–027 |
| `VINC005` | 031–034 |
| `VINC006` | 028–030 |
| `VINC007` | 035–038 |
| `VINC008` | 039–042 |
| `VINC009` | 043–046 |
| `VINC010` | 047–050 |
| `VINC011` | 051–054 |
| `VINC012` | 055–058 |

Cada código posee al menos tres casos negativos. Los 12 positivos fijan clasificación conservadora,
lifecycle, custodia, recovery, cierre, reapertura y operación segura.

## Materialización futura

- Usar incidents, identities, channels y artifacts totalmente sintéticos.
- Congelar clock, commit, components, policy y assignments.
- Simular cadencias y outages sin sleeps ni comunicación externa.
- Verificar transitions, severity, timeline, evidence graph, codes, writes y network.
- Los canaries sensibles deben ser obviamente ficticios y redactados.
- La materialización no crea incident registry ni dispara alertas.

## Estado

```yaml
catalogId: VINC-FIXTURE-CATALOG-V1
specifiedCases: 58
positiveCases: 12
negativeCases: 46
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
incidentsCreated: 0
onCallAssignments: 0
```

