# Catálogo de fixtures OWNA v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[contrato de autoridad, competencia y delegación](authority-capability-delegation-contract.md), sin
crear assignments, memberships, relaciones ni permisos reales.

## Envelope

```yaml
id: OWNA-FIX-NNN
kind: POSITIVE | NEGATIVE
input:
  act: <acto sintético>
  assignments: [<OWN sintéticos>]
  delegations: [<delegaciones sintéticas>]
  authorityRelations: [<relaciones sintéticas>]
  clock: <UTC congelado>
expected:
  authorized: <bool>
  code: <OWNA001..OWNA012|null>
  effectiveAssignments: [<IDs>]
  writes: 0
  networkRequests: 0
```

Las identidades, grupos, scopes, commits y evidence son ficticios. Un caso negativo declara un
código público primario aunque pueda producir detalles adicionales.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `OWNA-FIX-001` | Assignment personal aceptado, vigente y suficiente | acto autorizado |
| `OWNA-FIX-002` | Grupo con membership vigente y actor identificado | capability resuelta |
| `OWNA-FIX-003` | Contrato `T1` con owner/reviewer distintos | segregación satisfecha |
| `OWNA-FIX-004` | Acto `T2` reúne owner, technical y domain review | autorizado |
| `OWNA-FIX-005` | Delegación reduce scope/tier/capabilities | válida |
| `OWNA-FIX-006` | Delegación expira después de `decidedAt` | decisión histórica válida |
| `OWNA-FIX-007` | Escalamiento usa relation aceptada y acíclica | superior resuelto |
| `OWNA-FIX-008` | Reviewer en conflicto se recusa y reemplaza | cardinalidad satisfecha |
| `OWNA-FIX-009` | Revocación posterior conserva decisión histórica previa | historia válida |
| `OWNA-FIX-010` | Provider inaccesible sin evidence local suficiente | `UNKNOWN/BLOCKED`, sin autoridad fabricada |
| `OWNA-FIX-011` | Inputs permutados | misma resolución |
| `OWNA-FIX-012` | Resolución read-only/offline | cero writes y cero red |

## Schema, identidad y grupos

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNA-FIX-013` | Assignment/capability/status con schema inválido | `OWNA001` |
| `OWNA-FIX-014` | Assignment ID duplicada o reutilizada | `OWNA001` |
| `OWNA-FIX-015` | Capability desconocida o risk tier fuera de enum | `OWNA001` |
| `OWNA-FIX-016` | Persona no posee identity ref verificable | `OWNA002` |
| `OWNA-FIX-017` | Alias/lista textual se trata como grupo autoritativo | `OWNA002` |
| `OWNA-FIX-018` | Grupo carece de membership source/actor efectivo | `OWNA002` |
| `OWNA-FIX-019` | Membership posterior se usa para decisión histórica | `OWNA002` |

## Scope, tier y vigencia

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNA-FIX-020` | Capability correcta sobre otro scope | `OWNA003` |
| `OWNA-FIX-021` | Assignment `T1` intenta autorizar acto `T2` | `OWNA003` |
| `OWNA-FIX-022` | Assignment legacy sin capability/tier autoriza acto | `OWNA003` |
| `OWNA-FIX-023` | Ambigüedad de tier elige el inferior | `OWNA003` |
| `OWNA-FIX-024` | Assignment `PROPOSED/SUSPENDED` cuenta | `OWNA004` |
| `OWNA-FIX-025` | Assignment expirado/revocado cuenta | `OWNA004` |
| `OWNA-FIX-026` | Assignment se backdatea para cubrir decisión | `OWNA004` |
| `OWNA-FIX-027` | Cambio posterior de scope/capability reescribe historia | `OWNA004` |

## Segregación y delegación

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNA-FIX-028` | Autor es único reviewer donde se exige independencia | `OWNA005` |
| `OWNA-FIX-029` | Una identidad cuenta varias veces para cardinalidad | `OWNA005` |
| `OWNA-FIX-030` | Conflicto material no declarado/recusado | `OWNA005` |
| `OWNA-FIX-031` | Abstención reduce cardinalidad requerida | `OWNA005` |
| `OWNA-FIX-032` | Delegación amplía scope, tier o capability | `OWNA006` |
| `OWNA-FIX-033` | Delegación expirada o no aceptada cuenta | `OWNA006` |
| `OWNA-FIX-034` | Delegación forma ciclo o supera profundidad | `OWNA006` |
| `OWNA-FIX-035` | Capability no delegable se delega sin permiso | `OWNA006` |
| `OWNA-FIX-036` | Delegator/delegate cuentan separados en el mismo acto | `OWNA006` |

## Escalamiento y matriz

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNA-FIX-037` | Título “senior/admin/manager” infiere superioridad | `OWNA007` |
| `OWNA-FIX-038` | Authority relation está propuesta/revocada | `OWNA007` |
| `OWNA-FIX-039` | Grafo de escalamiento contiene ciclo | `OWNA007` |
| `OWNA-FIX-040` | Relation superior corresponde a otro capability/scope | `OWNA007` |
| `OWNA-FIX-041` | Acto omite capability requerida por matriz | `OWNA008` |
| `OWNA-FIX-042` | Matriz específica reduce mínimos globales | `OWNA008` |
| `OWNA-FIX-043` | Maintainer materializa sin decisión aprobada | `OWNA008` |
| `OWNA-FIX-044` | Acto `T3/T4` avanza sin policy específica | `OWNA008` |

## Invalidación, proyecciones y seguridad

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNA-FIX-045` | Revocar origen deja delegaciones activas | `OWNA009` |
| `OWNA-FIX-046` | Suspender assignment conserva approvals nuevas | `OWNA009` |
| `OWNA-FIX-047` | Conflicto posterior no crea finding/staleness | `OWNA009` |
| `OWNA-FIX-048` | README/CODEOWNERS se trata como registry autoritativo | `OWNA010` |
| `OWNA-FIX-049` | Provider group drifted conserva autoridad | `OWNA010` |
| `OWNA-FIX-050` | API inaccesible fabrica membership positiva | `OWNA010` |
| `OWNA-FIX-051` | Evidence contiene secreto/PII innecesario | `OWNA011` |
| `OWNA-FIX-052` | Actor no autorizado accede membership/evidence restringida | `OWNA011` |
| `OWNA-FIX-053` | Path/symlink de registry/evidence escapa del root | `OWNA011` |

## Determinismo

| ID | Mutación | Código |
| --- | --- | --- |
| `OWNA-FIX-054` | Clock cambia durante resolución | `OWNA012` |
| `OWNA-FIX-055` | Locale/timezone altera vigencia | `OWNA012` |
| `OWNA-FIX-056` | Orden de assignments/relations altera outcome | `OWNA012` |
| `OWNA-FIX-057` | Dos runs iguales emiten distinto orden/hash | `OWNA012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `OWNA001` | 013–015 |
| `OWNA002` | 016–019 |
| `OWNA003` | 020–023 |
| `OWNA004` | 024–027 |
| `OWNA005` | 028–031 |
| `OWNA006` | 032–036 |
| `OWNA007` | 037–040 |
| `OWNA008` | 041–044 |
| `OWNA009` | 045–047 |
| `OWNA010` | 048–050 |
| `OWNA011` | 051–053 |
| `OWNA012` | 054–057 |

Todos los códigos tienen al menos tres casos negativos. Los 12 positivos fijan autorización válida,
fail-closed, historia temporal y operación segura.

## Materialización futura

- Usar identities, groups, memberships y providers completamente sintéticos.
- Congelar clock, commit, scope, tier y registry hashes.
- Verificar capabilities efectivas, cardinalidad, conflicts y cadena de derivación.
- Simular provider outage sin realizar requests.
- Comparar outcome, códigos, assignments efectivos, orden y cero mutaciones.
- Ningún caso puede crear autoridad real ni consultar directorios corporativos.

## Estado

```yaml
catalogId: OWNA-FIXTURE-CATALOG-V1
specifiedCases: 57
positiveCases: 12
negativeCases: 45
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
acceptedAssignments: 0
acceptedDelegations: 0
acceptedAuthorityRelations: 0
```
