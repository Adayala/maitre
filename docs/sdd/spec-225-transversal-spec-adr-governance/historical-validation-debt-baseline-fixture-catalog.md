# Catálogo de fixtures SDBL v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[contrato de baseline de deuda histórica](historical-validation-debt-baseline-contract.md).
Este catálogo no materializa fixtures, no crea un baseline y no acepta findings actuales.

## Convenciones

Cada fixture debe declarar:

```yaml
id: SDBL-FIX-NNN
kind: POSITIVE | NEGATIVE
input:
  baseline: <documento mínimo o ref>
  currentScan: <findings observados>
  clock: <fecha UTC congelada>
  validatorVersion: <ref exacta>
expected:
  valid: <bool>
  codes: [<SDBL001..SDBL012>]
  classifications: [<UNCHANGED|MOVED|RESOLVED|NEW|DRIFTED|REAPPEARED|EXPIRED>]
  writes: 0
  networkRequests: 0
```

- Los hashes, commits, fechas y IDs de ejemplo son sintéticos.
- Un caso negativo puede producir varios detalles, pero tiene un único código público primario.
- La comparación ignora orden de entrada y hints de ubicación cuando existe identidad estable.
- Los fixtures no contienen secretos reales, PII ni rutas externas al árbol sintético.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `SDBL-FIX-001` | Baseline `DRAFT` completa, todavía no usada como excepción | válida; gate no consume aceptación |
| `SDBL-FIX-002` | Baseline `ACTIVE` con subject, policy, review y cero entries | válida; delta vacío |
| `SDBL-FIX-003` | Finding aceptado conserva fingerprint y ubicación | `UNCHANGED` |
| `SDBL-FIX-004` | Mismo fingerprint cambia sólo `lineHint` | `MOVED` |
| `SDBL-FIX-005` | Mismo ID estable cambia sólo `pathHint` por rename | `MOVED` |
| `SDBL-FIX-006` | Finding aceptado deja de observarse | `RESOLVED` |
| `SDBL-FIX-007` | Entry legacy migra a document ID mediante successor mapping | `MOVED`, historia preservada |
| `SDBL-FIX-008` | Expiry ausente con milestone aprobada y verificable | válida |
| `SDBL-FIX-009` | Successor elimina entries resueltas y reduce summary | válida |
| `SDBL-FIX-010` | Predecessor pasa a `SUPERSEDED` luego de activar successor | válida |
| `SDBL-FIX-011` | Input permutado produce mismo delta serializado | válida, byte-identical |
| `SDBL-FIX-012` | Evidence restringida se referencia sólo por ID/hash | válida, sin contenido sensible |

## Schema, subject e identidad

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBL-FIX-013` | `schemaVersion` ausente o no soportada | `SDBL001` |
| `SDBL-FIX-014` | `baselineId` no cumple namespace | `SDBL001` |
| `SDBL-FIX-015` | status desconocido o path canónico inseguro | `SDBL001` |
| `SDBL-FIX-016` | commit abreviado, mutable o distinto del scan | `SDBL002` |
| `SDBL-FIX-017` | `validatorVersion` no coincide con ejecución | `SDBL002` |
| `SDBL-FIX-018` | `configHash`, `scopeHash` o registry hash difiere | `SDBL002` |
| `SDBL-FIX-019` | `baselineFindingId` ausente/duplicado | `SDBL003` |
| `SDBL-FIX-020` | fingerprint usa algoritmo desconocido o hash inválido | `SDBL003` |
| `SDBL-FIX-021` | dos entries representan la misma identidad semántica | `SDBL003` |
| `SDBL-FIX-022` | fingerprint incorpora timestamp, línea u orden del scan | `SDBL003` |

## Aceptación, elegibilidad y expiración

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBL-FIX-023` | owner o review ref ausente/no aceptado | `SDBL004` |
| `SDBL-FIX-024` | issue durable ausente o inexistente | `SDBL004` |
| `SDBL-FIX-025` | reason, mitigación o removal condition vacía/genérica | `SDBL004` |
| `SDBL-FIX-026` | falso positivo conocido se baselinea en vez de corregir criterio | `SDBL005` |
| `SDBL-FIX-027` | finding nuevo posterior al rollout se presenta como histórico | `SDBL005` |
| `SDBL-FIX-028` | secret/credential/PII expuesto se baselinea | `SDBL005` |
| `SDBL-FIX-029` | traversal, SSRF o ejecución insegura se baselinea | `SDBL005` |
| `SDBL-FIX-030` | ID reutilizado/duplicado o aislamiento/autorización vulnerados | `SDBL005` |
| `SDBL-FIX-031` | corrupción de datos, evidencia falsificada o validator con writes/red | `SDBL005` |
| `SDBL-FIX-032` | expiry vencida continúa aceptada | `SDBL006` |
| `SDBL-FIX-033` | renovación modifica entry activa en sitio | `SDBL006` |
| `SDBL-FIX-034` | `RESOLVED/SUPERSEDED` sin successor coherente | `SDBL006` |

## Delta y ratchet

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBL-FIX-035` | fingerprint no registrado se omite o reporta `UNCHANGED` | `SDBL007` |
| `SDBL-FIX-036` | entry ID coincide pero code/target/criterio cambió y no es `DRIFTED` | `SDBL007` |
| `SDBL-FIX-037` | finding previamente resuelto reaparece y no es `REAPPEARED` | `SDBL007` |
| `SDBL-FIX-038` | la misma PR agrega finding y entry para aprobarse | `SDBL008` |
| `SDBL-FIX-039` | successor aumenta accepted count o severidad sin autoridad extraordinaria | `SDBL008` |
| `SDBL-FIX-040` | entry `RESOLVED` permanece en conjunto activo | `SDBL008` |
| `SDBL-FIX-041` | rename se interpreta como resolución más finding nuevo | `SDBL009` |
| `SDBL-FIX-042` | migración legacy→ID pierde predecessor/mapping | `SDBL009` |
| `SDBL-FIX-043` | re-ID duplica aceptación o borra historia | `SDBL009` |

## Review, seguridad y determinismo

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBL-FIX-044` | baseline se activa sin review completa del commit exacto | `SDBL010` |
| `SDBL-FIX-045` | review pertenece a config/scope/commit anterior | `SDBL010` |
| `SDBL-FIX-046` | predecessor se supersede antes de activar successor | `SDBL010` |
| `SDBL-FIX-047` | baseline copia mensaje/source con secreto sintético detectable | `SDBL011` |
| `SDBL-FIX-048` | path absoluto, traversal o symlink escape en entry/evidence | `SDBL011` |
| `SDBL-FIX-049` | evidencia restringida se incrusta en output público | `SDBL011` |
| `SDBL-FIX-050` | dos órdenes de input alteran summary/results | `SDBL012` |
| `SDBL-FIX-051` | reloj no congelado altera expiry durante una ejecución | `SDBL012` |
| `SDBL-FIX-052` | locale, timezone o concurrencia alteran serialización | `SDBL012` |

## Cobertura normativa

| Código | Fixtures mínimos |
| --- | --- |
| `SDBL001` | 013–015 |
| `SDBL002` | 016–018 |
| `SDBL003` | 019–022 |
| `SDBL004` | 023–025 |
| `SDBL005` | 026–031 |
| `SDBL006` | 032–034 |
| `SDBL007` | 035–037 |
| `SDBL008` | 038–040 |
| `SDBL009` | 041–043 |
| `SDBL010` | 044–046 |
| `SDBL011` | 047–049 |
| `SDBL012` | 050–052 |

Todos los códigos tienen al menos un caso negativo. Los casos 001–012 fijan comportamiento positivo
para evitar que una implementación “pase” rechazando todo.

## Criterios para materialización futura

- Cada fixture debe vivir en árbol aislado y declarar expected output completo.
- El runner debe usar filesystem temporal, clock inyectado, red deshabilitada y modo read-only.
- Deben comprobarse código público, detalle, clasificación, orden, exit status y cero mutaciones.
- Los casos sensibles usan tokens obviamente sintéticos y verifican redacción, no exposición.
- La materialización requiere aprobación del schema/path/policy y no puede activar un baseline.

## Estado

```yaml
catalogId: SDBL-FIXTURE-CATALOG-V1
specifiedCases: 52
positiveCases: 12
negativeCases: 40
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
baselineCreated: false
acceptedFindings: 0
```
