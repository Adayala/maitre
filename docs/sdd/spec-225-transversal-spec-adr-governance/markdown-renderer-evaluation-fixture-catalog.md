# Catálogo de fixtures RSEL schema v1 — SPEC-225

## Propósito

Definir casos de conformidad para validar packages `MD-RENDER-EVAL`. No son las 48 fixtures del
slugger: estas fixtures validan evidencia, cobertura, provenance, comparación y decisión.

## Formato

```yaml
id: RSEL-FIX-NNN
kind: POSITIVE | NEGATIVE | STALENESS | DETERMINISM
input: <package lógico mínimo>
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  codes: [RSELxxx]
```

Hashes/SHAs simbólicos sólo sirven para la especificación. Los casos ejecutables deberán usar
formatos y longitudes válidos.

## Casos positivos

### RSEL-FIX-001 — Package completo sin selección

Package `COMPLETE`, inputs/hashes coherentes, un candidato elegible, dos runs deterministas,
cobertura 48+10, comparison completo y decision `DRAFT/REQUEST_MORE_EVIDENCE`.

Expected: `ACCEPT`; no activa profile.

### RSEL-FIX-002 — Selección emitida válida

Un solo candidato `ELIGIBLE`, cero findings eliminatorios, decision `ISSUED/SELECT`, profile exacto,
DOC-REV de package y profile presente.

Expected: `ACCEPT`; la activación sigue siendo una operación atómica externa al package.

### RSEL-FIX-003 — Rechazo de todos

Dos candidatos, cada uno con finding eliminatorio abierto y evidence ref; decision
`ISSUED/REJECT_ALL`.

Expected: `ACCEPT`; `selectedCandidate` y `selectedProfile` son nulos.

### RSEL-FIX-004 — Bloqueo por autoridad

Consumer authority pendiente, finding `OWNERSHIP_BLOCKED`, decision `DRAFT/BLOCKED`.

Expected: `ACCEPT`; package no puede quedar `ACCEPTED`.

### RSEL-FIX-005 — Divergencia resuelta por primario

Dos outputs distintos, strategy `PRIMARY_WITH_WARNINGS`, disposition `ACCEPT_PRIMARY`, consumer
primario aprobado y secondary finding con owner.

Expected: `ACCEPT` si la política permite warning; divergencia permanece visible.

### RSEL-FIX-006 — Fragment fallido con finding

Nueve `RESOLVED`, uno `NOT_FOUND` con `MD-RENDER-FIND-*`; decision
`REQUEST_MORE_EVIDENCE`.

Expected: `ACCEPT`; `repositoryFragmentsAssessed=10`, `resolved=9`, sin falsear 10/10.

### RSEL-FIX-007 — Supersession válida

Nuevo evaluation package referencia uno `STALE`, IDs distintos, cadena acíclica y hashes nuevos.

Expected: `ACCEPT`; el package anterior permanece inmutable.

### RSEL-FIX-008 — Excepción temporal válida

Finding `MEDIUM`, no eliminatorio, status `ACCEPTED_EXCEPTION`, owner/mitigación/vencimiento vigentes.

Expected: `ACCEPT`; no se aplica a red, versión mutable ni no determinismo.

## Envelope, scope y provenance

### RSEL-FIX-009 — Schema o ID inválido

Subcasos: schema desconocido, ID malformado, status desconocido y supersession cíclica.

Expected: `REJECT [RSEL001]`.

### RSEL-FIX-010 — Subject commit corto

Expected: `REJECT [RSEL002]`.

### RSEL-FIX-011 — Snapshot/hash inconsistente

El snapshot corresponde a otro commit o un contract hash no coincide.

Expected: `REJECT [RSEL002]`.

### RSEL-FIX-012 — Componente mutable

Candidate usa range, tag mutable, referencia sin digest o versión ausente.

Expected: `REJECT [RSEL003]`; candidate no puede ser `ELIGIBLE`.

### RSEL-FIX-013 — Provenance incompleta

Falta artifact hash, source ref o licencia.

Expected: `REJECT [RSEL003]`.

## Entorno y runs

### RSEL-FIX-014 — Red habilitada u observada

Subcasos `network: ENABLED` y `networkObserved: true`.

Expected: `REJECT [RSEL004]`; no admite excepción.

### RSEL-FIX-015 — Entorno no fijado

Falta runtime exacto, lockfile/image hash, locale o arquitectura.

Expected: `REJECT [RSEL004]`.

### RSEL-FIX-016 — Estado inicial sucio

`startedFromCleanState: false` sin snapshot/equivalencia admitida.

Expected: `REJECT [RSEL004]`.

### RSEL-FIX-017 — Segunda repetición ausente

Expected: `REJECT [RSEL005]`.

### RSEL-FIX-018 — Run duplicado o drift

Subcasos: mismo run ID repetido, repetition duplicada, environment/input hash distinto entre runs.

Expected: `REJECT [RSEL005]`.

## Cobertura y determinismo

### RSEL-FIX-019 — Fixture omitida

Se reportan 47 de 48 fixtures o falta una observation aunque el summary diga 48.

Expected: `REJECT [RSEL006]`.

### RSEL-FIX-020 — Fragment omitido

Se reportan 9 de 10 rows `FRAG-*`.

Expected: `REJECT [RSEL006]`.

### RSEL-FIX-021 — Conteos no cierran

`resolved + notFound + ambiguous != total`, o errors/observed contradicen observations.

Expected: `REJECT [RSEL006]`.

### RSEL-FIX-022 — Outputs distintos entre repeticiones

Mismos inputs/environment; cambia generated ID, order o outcome.

Expected: `REJECT [RSEL007]`; finding eliminatorio.

### RSEL-FIX-023 — Normalización posterior

El artifact comparable reordena generated IDs o elimina caracteres invisibles sin allowlist
específica.

Expected: `REJECT [RSEL007]`.

## Comparison, divergencias y findings

### RSEL-FIX-024 — Comparison incompleto

Omitir filas idénticas reduce el artifact a sólo divergencias.

Expected: `REJECT [RSEL008]`; deben existir 48+10 filas por candidato.

### RSEL-FIX-025 — Divergencia inconsistente

Outputs distintos marcados `IDENTICAL`, o `DIVERGENT` sin manifest.

Expected: `REJECT [RSEL008]`.

### RSEL-FIX-026 — Divergencia material sin disposition

Strategy/disposition `UNDECIDED` o owner `UNASSIGNED`.

Expected: `REJECT [RSEL008]` para una decision `SELECT`; puede mantenerse como package `DRAFT`.

### RSEL-FIX-027 — Finding incompleto

Falta subject, evidence, resolución esperada o owner requerido.

Expected: `REJECT [RSEL009]`.

### RSEL-FIX-028 — Excepción prohibida

Se acepta excepción para red observada, componente mutable o no determinismo.

Expected: `REJECT [RSEL009]`.

### RSEL-FIX-029 — Finding eliminatorio oculto

Run demuestra fallo, pero candidate figura `ELIGIBLE` sin finding.

Expected: `REJECT [RSEL009]`.

## Decisión, review y activación

### RSEL-FIX-030 — Select sin candidato elegible

Candidate está `PROPOSED` o `REJECTED`.

Expected: `REJECT [RSEL010]`.

### RSEL-FIX-031 — Select múltiple

Dos candidates `SELECTED` o decision posee más de un selected candidate.

Expected: `REJECT [RSEL010]`.

### RSEL-FIX-032 — Reject all sin evidencia

Un candidato no tiene finding eliminatorio.

Expected: `REJECT [RSEL010]`.

### RSEL-FIX-033 — Outcome contradice campos

`BLOCKED` con selected profile, o `SELECT` con selected fields nulos.

Expected: `REJECT [RSEL010]`.

### RSEL-FIX-034 — Decision issued sin review

Expected: `REJECT [RSEL011]`.

### RSEL-FIX-035 — Reviewer/assignment inválido

Review ausente, stale, self-review prohibido o assignment no aceptado.

Expected: `REJECT [RSEL011]`.

### RSEL-FIX-036 — Activación prematura

Profile figura `ACTIVE` con package sólo `COMPLETE/IN_REVIEW` o sin review `TOOL_PROFILE`.

Expected: `REJECT [RSEL011]`.

## Seguridad, serialización y staleness

### RSEL-FIX-037 — Secret o PII

Record contiene token, cookie, credential, environment dump o PII.

Expected: `REJECT [RSEL012]`; salida redactada sin persistir valor ni hash del secret.

### RSEL-FIX-038 — Path absoluto

Artifact incluye ruta local absoluta.

Expected: `REJECT [RSEL012]`.

### RSEL-FIX-039 — Orden variable

Mismos records/listas no semánticas en distinto orden.

Expected: canonicalización produce bytes idénticos; de lo contrario `REJECT [RSEL012]`.
El orden de generated IDs no se reordena.

### RSEL-FIX-040 — Input cambia después del package

Cambia commit, contract hash, fixture, fragment, component, environment o consumer authority.

Expected: `MARK_STALE [RSEL002]`; emitir successor, no editar package.

### RSEL-FIX-041 — Review posterior sobre evidence stale

Se intenta aprobar un package cuyo input ya cambió.

Expected: `MARK_STALE [RSEL011]`; el review no revive evidence.

### RSEL-FIX-042 — Cambio sólo de línea

Un fragment conserva source/target/text hashes y raw target, pero cambia línea.

Expected: `ACCEPT`; no se marca stale únicamente por línea.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| outcomes válidos | 001–008 |
| envelope/scope/provenance | 009–013, 040 |
| entorno/runs | 014–018 |
| cobertura/determinismo | 019–023, 039 |
| comparison/findings | 024–029 |
| decisión/review/activación | 030–036, 041 |
| seguridad/staleness | 037–042 |

Todos los códigos `RSEL001`–`RSEL012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Casos positivos, negativos, determinismo y staleness especificados.
- [x] Doce códigos cubiertos.
- [x] Selección, rechazo, bloqueo y evidencia insuficiente cubiertos.
- [x] Coverage 48+10 y divergencias cubiertas.
- [ ] Materializar fixtures ejecutables.
- [ ] Implementar validator después de aprobar schema/catálogo.
- [ ] Registrar DOC-REV de schema y catálogo.

Los últimos tres checks permanecen abiertos.
