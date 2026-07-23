# Catálogo de fixtures OWNR v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[registro de ownership y autoridad](ownership-authority-registry-contract.md), sin crear el root,
manifest, identities, assignments ni conexiones a providers.

## Envelope

```yaml
id: OWNR-FIX-NNN
kind: POSITIVE | NEGATIVE
filesystem: <árbol sintético>
operation: READ | ALLOCATE | PROPOSE | ACTIVATE | SUPERSEDE | RECOVER
expected:
  valid: <bool>
  code: <OWNR001..OWNR012|null>
  effectiveRevision: <entero|null>
  effectiveRecordIds: [<IDs>]
  writes: <entero>
  networkRequests: 0
```

Los casos usan refs, hashes, memberships y evidencia ficticios. Ningún fixture contiene PII real
ni consulta un directorio externo.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `OWNR-FIX-001` | Root ausente antes de activación | `NOT_CONFIGURED`, cero autoridad |
| `OWNR-FIX-002` | Manifest DRAFT completo | válido, no efectivo |
| `OWNR-FIX-003` | Manifest ACTIVE con records/hashes/review exactos | revisión efectiva |
| `OWNR-FIX-004` | Identity usa stable ref opaca y label no sensible | válida |
| `OWNR-FIX-005` | Allocator reserva ID con revision esperada | ID único |
| `OWNR-FIX-006` | Reserva cancelada crea tombstone | ID no reutilizable |
| `OWNR-FIX-007` | Successor preserva predecessor y hash | historia válida |
| `OWNR-FIX-008` | Provider outage sin evidence fresca | `UNKNOWN/BLOCKED` |
| `OWNR-FIX-009` | Propuesta concurrente detecta revision stale | rechazada sin merge |
| `OWNR-FIX-010` | Recovery restaura revisión aprobada exacta | hashes verificados |
| `OWNR-FIX-011` | Directory listing permutado | misma resolución |
| `OWNR-FIX-012` | CI lee registry offline/read-only | cero writes y red |

## Root, manifest y revisión

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNR-FIX-013` | Root absoluto, traversal, NUL o layout desconocido | `OWNR001` |
| `OWNR-FIX-014` | Manifest/schema/format inválido | `OWNR001` |
| `OWNR-FIX-015` | Filename no coincide con record ID | `OWNR001` |
| `OWNR-FIX-016` | Archivo temporal/backup versionado dentro del root | `OWNR001` |
| `OWNR-FIX-017` | ACTIVE sin subject commit/review | `OWNR002` |
| `OWNR-FIX-018` | Revision retrocede o no incrementa | `OWNR002` |
| `OWNR-FIX-019` | Review corresponde a otro manifest/hash/commit | `OWNR002` |
| `OWNR-FIX-020` | Dos manifests se consideran ACTIVE | `OWNR002` |

## IDs, allocator e identidad

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNR-FIX-021` | ID duplicada/reutilizada entre records | `OWNR003` |
| `OWNR-FIX-022` | Allocator usa máximo+1 sin revision/lock | `OWNR003` |
| `OWNR-FIX-023` | Dos reservas concurrentes reciben mismo ID | `OWNR003` |
| `OWNR-FIX-024` | ID cancelada vuelve a asignarse | `OWNR003` |
| `OWNR-FIX-025` | Import legacy carece de mapping/tombstone | `OWNR003` |
| `OWNR-FIX-026` | Identity carece de opaque stable ref | `OWNR004` |
| `OWNR-FIX-027` | Email/nombre legal/username mutable se usa como ID | `OWNR004` |
| `OWNR-FIX-028` | SERVICE recibe `ACCEPT_RISK`/`APPROVE_POLICY` | `OWNR004` |
| `OWNR-FIX-029` | Provider concede capabilities automáticamente | `OWNR004` |

## Integridad e historia

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNR-FIX-030` | Record listado está ausente o hash difiere | `OWNR005` |
| `OWNR-FIX-031` | Record existe pero no figura en manifest | `OWNR005` |
| `OWNR-FIX-032` | Manifest apunta a path/record type incorrecto | `OWNR005` |
| `OWNR-FIX-033` | Un archivo contiene múltiples records | `OWNR005` |
| `OWNR-FIX-034` | Record aceptado se edita en sitio | `OWNR006` |
| `OWNR-FIX-035` | Successor omite `supersedes`/change reason | `OWNR006` |
| `OWNR-FIX-036` | Rename/delete pierde mapping o historia | `OWNR006` |
| `OWNR-FIX-037` | Retirar identity borra decisiones históricas | `OWNR006` |

## Resolución y concurrencia

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNR-FIX-038` | Scanner descubre record huérfano como autoridad | `OWNR007` |
| `OWNR-FIX-039` | Resolución omite identity/provider evidence requerida | `OWNR007` |
| `OWNR-FIX-040` | Delegation/relation graph cíclico se resuelve | `OWNR007` |
| `OWNR-FIX-041` | Cadena de derivación no se reporta | `OWNR007` |
| `OWNR-FIX-042` | Manifest publica antes que records/evidence | `OWNR008` |
| `OWNR-FIX-043` | Writer ignora revision esperada | `OWNR008` |
| `OWNR-FIX-044` | Merge combina assignments concurrentes | `OWNR008` |
| `OWNR-FIX-045` | CI repara, reordena o genera registry | `OWNR008` |

## Providers, privacidad y seguridad

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNR-FIX-046` | Provider stale/outage se interpreta positivo | `OWNR009` |
| `OWNR-FIX-047` | README/CODEOWNERS drift sobrescribe manifest | `OWNR009` |
| `OWNR-FIX-048` | Provider “más reciente” reemplaza assignment | `OWNR009` |
| `OWNR-FIX-049` | Reconciliation modifica registry sin review | `OWNR009` |
| `OWNR-FIX-050` | Registry almacena email/teléfono/nombre legal | `OWNR010` |
| `OWNR-FIX-051` | Membership dump/organigrama se versiona | `OWNR010` |
| `OWNR-FIX-052` | Privacy erasure borra historia o deja binding reversible | `OWNR010` |
| `OWNR-FIX-053` | Retención/acceso de evidence no está definida | `OWNR010` |
| `OWNR-FIX-054` | Symlink/path escapa del root | `OWNR011` |
| `OWNR-FIX-055` | Record/evidence contiene secret sintético | `OWNR011` |
| `OWNR-FIX-056` | CI/runtime/actor no autorizado escribe | `OWNR011` |

## Determinismo y recovery

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNR-FIX-057` | Falta manifest y se elige archivo más nuevo | `OWNR012` |
| `OWNR-FIX-058` | mtime/listing order altera revisión | `OWNR012` |
| `OWNR-FIX-059` | Locale/timezone altera hashes/serialización | `OWNR012` |
| `OWNR-FIX-060` | Dos runs iguales cambian order/derivation report | `OWNR012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `OWNR001` | 013–016 |
| `OWNR002` | 017–020 |
| `OWNR003` | 021–025 |
| `OWNR004` | 026–029 |
| `OWNR005` | 030–033 |
| `OWNR006` | 034–037 |
| `OWNR007` | 038–041 |
| `OWNR008` | 042–045 |
| `OWNR009` | 046–049 |
| `OWNR010` | 050–053 |
| `OWNR011` | 054–056 |
| `OWNR012` | 057–060 |

Cada código posee al menos tres casos negativos. Los 12 positivos fijan fail-closed, allocator,
historia, outage, concurrencia, recovery y operación segura.

## Materialización futura

- Usar root temporal y filesystem sintético por caso.
- Congelar revision, commit, hashes, clock, locale y timezone.
- Simular provider/evidence; no realizar requests ni usar identidades reales.
- Verificar records efectivos, derivation chain, codes, writes y network.
- Los canaries de privacidad son valores obviamente sintéticos.
- Materializar fixtures no crea `.sdd/governance/authority`.

## Estado

```yaml
catalogId: OWNR-FIXTURE-CATALOG-V1
specifiedCases: 60
positiveCases: 12
negativeCases: 48
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
registryCreated: false
identityRecords: 0
authorityRecords: 0
```
