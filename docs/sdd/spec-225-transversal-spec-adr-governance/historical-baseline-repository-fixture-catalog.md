# Catálogo de fixtures SDBS v1 — SPEC-225

## Propósito

Especificar la conformidad del
[repositorio de baselines históricos](historical-baseline-repository-contract.md) sin crear el root
propuesto, archivos físicos, runner ni baseline activa.

## Envelope de caso

```yaml
id: SDBS-FIX-NNN
kind: POSITIVE | NEGATIVE
filesystem: <árbol sintético>
operation: READ | PROPOSE | ACTIVATE | SUPERSEDE | RECOVER
expected:
  valid: <bool>
  code: <SDBS001..SDBS012|null>
  selectedBaselineId: <ID|null>
  writes: <entero>
  networkRequests: 0
```

Los paths son relativos a un root fixture temporal. Los hashes, commits, owners y reviews son
sintéticos; ningún caso contiene credenciales reales.

## Casos positivos

| ID | Operación | Resultado esperado |
| --- | --- | --- |
| `SDBS-FIX-001` | Root ausente antes del rollout | `BASELINE_NOT_CONFIGURED`, no baseline seleccionada |
| `SDBS-FIX-002` | Root presente sin `active.yaml` antes de requerir baseline | no baseline seleccionada |
| `SDBS-FIX-003` | Pointer completo referencia history/evidence válidos | baseline exacta seleccionada |
| `SDBS-FIX-004` | Propuesta agrega DRAFT a history sin cambiar pointer | activo anterior permanece |
| `SDBS-FIX-005` | Activación agrega baseline/evidence y cambia pointer conjuntamente | nuevo baseline activo |
| `SDBS-FIX-006` | Successor válido preserva predecessor | ambos en history, successor activo |
| `SDBS-FIX-007` | Dos lectores concurrentes observan pointer estable | mismo resultado |
| `SDBS-FIX-008` | Propuesta concurrente detecta predecessor stale | se rechaza sin writes parciales |
| `SDBS-FIX-009` | Recovery restaura pointer desde evidence verificada | baseline aprobada seleccionada |
| `SDBS-FIX-010` | Input listing permutado | selección y reporte idénticos |
| `SDBS-FIX-011` | Evidence restringida usa sólo ID/hash | válida, sin material sensible |
| `SDBS-FIX-012` | CI ejecuta lectura completa | cero writes y cero red |

## Root, layout y pointer

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBS-FIX-013` | Root absoluto, con `..`, NUL o encoding ambiguo | `SDBS001` |
| `SDBS-FIX-014` | Archivo history fuera del directorio normativo | `SDBS001` |
| `SDBS-FIX-015` | Filename no coincide con `baselineId` | `SDBS001` |
| `SDBS-FIX-016` | Archivo temporal/backup desconocido dentro del root | `SDBS001` |
| `SDBS-FIX-017` | Gate required sin `active.yaml` | `SDBS002` |
| `SDBS-FIX-018` | Pointer vacío, truncado o con campos requeridos ausentes | `SDBS002` |
| `SDBS-FIX-019` | Pointer refiere history/evidence inexistente | `SDBS002` |
| `SDBS-FIX-020` | Pointer contiene entries/overrides embebidos | `SDBS002` |

## Hashes, inmutabilidad y estado

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBS-FIX-021` | `baselineSha256` difiere del contenido | `SDBS003` |
| `SDBS-FIX-022` | `evidenceSha256` difiere del contenido | `SDBS003` |
| `SDBS-FIX-023` | Hash tiene algoritmo/formato no permitido | `SDBS003` |
| `SDBS-FIX-024` | Baseline previamente activa fue editada | `SDBS004` |
| `SDBS-FIX-025` | Predecessor aprobado fue eliminado | `SDBS004` |
| `SDBS-FIX-026` | History se reescribe para cambiar expiry | `SDBS004` |
| `SDBS-FIX-027` | Pointer activa baseline `DRAFT` | `SDBS005` |
| `SDBS-FIX-028` | Pointer activa baseline `REJECTED` o `STALE` | `SDBS005` |
| `SDBS-FIX-029` | Pointer selecciona predecessor expirado como rollback silencioso | `SDBS005` |

## Evidence, atomicidad y autorización

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBS-FIX-030` | Evidence corresponde a otro baseline/hash | `SDBS006` |
| `SDBS-FIX-031` | `reviewedCommit` no contiene el cambio activado | `SDBS006` |
| `SDBS-FIX-032` | Reviewer/decision ausente o `REJECTED` | `SDBS006` |
| `SDBS-FIX-033` | Pointer cambia antes de incorporar history/evidence | `SDBS007` |
| `SDBS-FIX-034` | Activación espera predecessor distinto del observado | `SDBS007` |
| `SDBS-FIX-035` | Merge combina automáticamente entries concurrentes | `SDBS007` |
| `SDBS-FIX-036` | Job CI crea o actualiza baseline | `SDBS008` |
| `SDBS-FIX-037` | Runtime productivo escribe o selecciona baseline | `SDBS008` |
| `SDBS-FIX-038` | Actor sin assignment aceptado activa pointer | `SDBS008` |

## Seguridad, compatibilidad y autoridad

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBS-FIX-039` | Symlink en pointer/history/evidence escapa del root | `SDBS009` |
| `SDBS-FIX-040` | Traversal o path absoluto en pointer | `SDBS009` |
| `SDBS-FIX-041` | Evidence pública contiene secreto/PII sintético | `SDBS009` |
| `SDBS-FIX-042` | `schemaVersion` desconocida se acepta | `SDBS010` |
| `SDBS-FIX-043` | YAML inválido, BOM o line endings no permitidos | `SDBS010` |
| `SDBS-FIX-044` | Migración pierde IDs/hashes/mappings previos | `SDBS010` |
| `SDBS-FIX-045` | Ausencia/corrupción cae a artifact de CI | `SDBS011` |
| `SDBS-FIX-046` | Cache o variable de entorno reemplaza pointer versionado | `SDBS011` |
| `SDBS-FIX-047` | Remote URL aporta baseline autoritativa | `SDBS011` |

## Determinismo y recuperación

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBS-FIX-048` | Selección usa “archivo más nuevo” cuando falta pointer | `SDBS012` |
| `SDBS-FIX-049` | Orden del directory listing altera baseline seleccionada | `SDBS012` |
| `SDBS-FIX-050` | Locale/timezone altera serialización o hashes | `SDBS012` |
| `SDBS-FIX-051` | Dos ejecuciones producen orden distinto de diagnósticos | `SDBS012` |
| `SDBS-FIX-052` | Recovery reconstruye pointer desde summary sin verificar evidence | `SDBS012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `SDBS001` | 013–016 |
| `SDBS002` | 017–020 |
| `SDBS003` | 021–023 |
| `SDBS004` | 024–026 |
| `SDBS005` | 027–029 |
| `SDBS006` | 030–032 |
| `SDBS007` | 033–035 |
| `SDBS008` | 036–038 |
| `SDBS009` | 039–041 |
| `SDBS010` | 042–044 |
| `SDBS011` | 045–047 |
| `SDBS012` | 048–052 |

Los 12 casos positivos impiden una implementación que rechace todo. Cada código público tiene al
menos tres casos negativos.

## Materialización futura

- Usar árboles aislados y un root temporal explícito por caso.
- Congelar clock, umask, locale, timezone y orden de enumeración.
- Simular concurrencia mediante predecessor esperado, sin carreras temporales frágiles.
- Verificar contenido, permisos observables, writes, red, exit status y diagnostics.
- Los casos de recovery trabajan con copias sintéticas, nunca con el repositorio real.
- La materialización no crea `.sdd/baselines/validation` ni activa deuda.

## Estado

```yaml
catalogId: SDBS-FIXTURE-CATALOG-V1
specifiedCases: 52
positiveCases: 12
negativeCases: 40
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
repositoryRootCreated: false
activeBaseline: null
```
