# Contrato de disponibilidad y continuidad del validator SDD — SPEC-225

## Propósito

Definir el comportamiento ante timeout, crash, infraestructura indisponible, provider desconocido o
degradación del validator en CI. Separa falla del cambio (`VALIDATION_FAILED`) de incapacidad para
validar (`VALIDATION_UNAVAILABLE`) y prohíbe bypass implícito.

Este contrato no configura retries, branch protection, alertas ni rollback.

## Outcomes operativos

```text
VALIDATION_PASSED
VALIDATION_FAILED
VALIDATION_UNAVAILABLE
VALIDATION_CANCELLED
VALIDATION_STALE
```

- `PASSED`: ejecución completa sobre subject/config exactos.
- `FAILED`: ejecución completa encontró incumplimientos.
- `UNAVAILABLE`: no pudo producir outcome confiable.
- `CANCELLED`: reemplazada/interrumpida antes de completar.
- `STALE`: resultado completo pero ya no corresponde al subject efectivo.

Sólo `PASSED` satisface un required gate. `FAILED` nunca se reclasifica como unavailable para usar
continuidad.

## Clases de falla

| Clase | Ejemplos | Outcome |
| --- | --- | --- |
| `SUBJECT_FAILURE` | finding normativo, baseline drift | `FAILED` |
| `VALIDATOR_DEFECT` | crash, excepción interna, output corrupto | `UNAVAILABLE` |
| `INFRA_FAILURE` | runner sin capacidad, filesystem temporal fallido | `UNAVAILABLE` |
| `CONFIG_FAILURE` | schema/hash/version inválida | `UNAVAILABLE` y finding de config |
| `DEPENDENCY_UNKNOWN` | provider/authority evidence requerida no verificable | `UNAVAILABLE` |
| `TIME_BUDGET_EXCEEDED` | deadline determinista superada | `UNAVAILABLE` |
| `CANCELLATION` | run superseded por commit nuevo | `CANCELLED` |
| `STALE_RESULT` | SHA/config cambió tras ejecutar | `STALE` |
| `SECURITY_FAILURE` | write/red indebida, tampering | `UNAVAILABLE` + incidente; fail-closed |

La clasificación se basa en evidencia, no en exit code aislado.

## Policy propuesta por modo

```yaml
availabilityPolicy:
  policyId: SDD-AVAIL-POLICY-001
  status: PROPOSED_NOT_APPROVED
  modes:
    SHADOW:
      unavailableBlocksMerge: false
      alert: true
      resultLabel: NOT_ENFORCED
    RATCHET_REQUIRED:
      unavailableBlocksMerge: true
      alert: true
      bypassAllowed: false
    STRICT:
      unavailableBlocksMerge: true
      alert: true
      bypassAllowed: false
    EXCEPTIONS_ENABLED:
      unavailableBlocksMerge: true
      exceptionConsumptionAllowed: false
```

Shadow no bloquea porque todavía no es enforcement, pero debe mostrar claramente que no validó. En
required/strict, unavailable bloquea hasta recuperar o ejecutar rollback formal del modo.

## Time budgets

Valores candidatos, no aprobados:

```yaml
budgets:
  queueMaximum: 10m
  executionSoft: 5m
  executionHard: 10m
  totalMaximum: 20m
  evidenceUploadMaximum: 2m
```

- queue y execution se miden por separado;
- hard timeout produce `UNAVAILABLE`, no `PASSED`;
- soft timeout emite señal pero permite completar hasta hard;
- cancelación por run más nuevo no cuenta como outage si el nuevo run completa;
- clock monotónico mide duración; UTC timestamp sólo registra;
- aumentar budgets requiere review de costo/feedback y nueva policy.

## Retry

- máximo candidato: 2 retries automáticos para errores transitorios clasificados;
- backoff determinista con jitter acotado y registrado;
- cada intento conserva subject/config/baseline hashes;
- findings deterministas, config inválida y security failures no se retryean para buscar un pass;
- un pass posterior conserva evidencia de intentos previos;
- retry agotado produce `UNAVAILABLE`;
- rerun manual no modifica el commit ni borra evidencia anterior.

Los valores se mantienen propuestos hasta observar duración/failure modes en shadow.

## Fuente del resultado

El gate consume un único run autoritativo:

- commit SHA exacto;
- workflow/tool version exacta;
- config/policy/baseline/registry hashes;
- attempt chain completa;
- artifact hashes;
- conclusión firmada por el check configurado.

No se acepta:

- run de otro commit/branch;
- resultado local adjunto por el autor;
- cache como resultado;
- artifact de ejecución previa;
- “último pass conocido”;
- comentario/label para forzar success.

## Degradación

No existe fail-open. Las únicas acciones son:

1. recuperar y reejecutar el mismo modo;
2. corregir infraestructura/config mediante cambio revisado;
3. aplicar rollback formal a un modo anterior mediante `GACT`;
4. esperar/restaurar provider/evidence requerido.

Un rollback a shadow cambia explícitamente el enforcement y debe ser visible; no marca el validator
como passed. Hallazgos no exceptuables permanecen bloqueantes por controles independientes.

## Continuidad y rollback

Rollback puede considerarse si:

- outage excede el objetivo aprobado;
- existe impacto operativo material documentado;
- no hay sospecha de tampering/security failure sin contener;
- target activation fue previamente `VERIFIED`;
- actor posee capabilities;
- trigger y máximo de decisión están en manifest.

No puede:

- seleccionar config/baseline no revisada;
- borrar evidence/outage history;
- consumir excepciones durante unavailable;
- convertir failures normativos en outages;
- desactivar controles de seguridad/autorización.

## Recuperación

Antes de volver a required:

1. causa clasificada y finding/incident enlazado;
2. validator/config restaurados con hash revisado;
3. fixtures y canaries completos verdes;
4. dos runs deterministas sobre subject controlado;
5. permissions/artifacts/retention verificados;
6. backlog de commits afectados revalidado;
7. activation de recuperación `APPLIED` y luego `VERIFIED`.

Un pass aislado no demuestra recuperación.

## SLO y medición

Objetivos candidatos para shadow:

```yaml
measurementWindow: 30d
minimumRuns: 100
metrics:
  completionRate: OBSERVE
  p50Queue: OBSERVE
  p95Queue: OBSERVE
  p50Execution: OBSERVE
  p95Execution: OBSERVE
  unavailableRate: OBSERVE
  retryRecoveryRate: OBSERVE
  staleCancellationRate: OBSERVE
```

No se fijan SLO numéricos sin baseline observado. Una ventana con menos runs se marca
`INSUFFICIENT_SAMPLE`, no se extrapola.

## Alertas e incidentes

Alertas mínimas:

- unavailable en required/strict;
- security failure;
- unavailable rate sobre threshold aprobado;
- retries agotados;
- artifact/evidence mismatch;
- required check ausente o renombrado;
- rollback aplicado.

Alertar no reemplaza bloqueo. Destinos, on-call y severidades permanecen `UNASSIGNED`.

## Artefactos y retención

Se preservan:

- classification y attempt chain;
- versions/hashes/subject;
- timings normalizados;
- diagnostics redactados;
- activation/mode efectivo;
- recovery/rollback refs.

No se preservan secrets, source completo innecesario ni provider payloads. La retención exacta
requiere policy aprobada y no puede ser menor a la ventana de revisión/incidente aplicable.

## Códigos

| Código | Condición |
| --- | --- |
| `VAVL001` | policy/schema/ID/mode/outcome inválido |
| `VAVL002` | failure class/outcome mal clasificado |
| `VAVL003` | subject/tool/config/baseline/registry mismatch |
| `VAVL004` | budget/deadline/clock inválido |
| `VAVL005` | retry/backoff/attempt chain inválido |
| `VAVL006` | run no autoritativo, stale o cache/artifact reutilizado |
| `VAVL007` | fail-open/bypass/degradación implícita |
| `VAVL008` | rollback/continuidad no autorizado o inseguro |
| `VAVL009` | recovery/revalidation insuficiente |
| `VAVL010` | SLO/métrica/muestra/alerta engañosa |
| `VAVL011` | artifact sensible, acceso o retención inválida |
| `VAVL012` | clasificación/timing/reporte no determinista |

## Estado

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
policyId: SDD-AVAIL-POLICY-001
effectivePolicy: null
observedRuns: 0
approvedSloTargets: 0
alertDestinationsAssigned: 0
rollbackConfigured: false
```

## Criterios de salida

- [x] Outcomes, clases y policy por modo especificados.
- [x] Budgets, retries, autoridad del resultado y degradación especificados.
- [x] Continuidad, recovery, SLO, alertas y artifacts especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `VAVL`.
- [ ] Observar shadow y aprobar budgets/retries/SLO.
- [ ] Asignar alertas/on-call y aprobar rollback.
