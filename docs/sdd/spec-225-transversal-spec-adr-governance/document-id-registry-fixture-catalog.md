# Catálogo de fixtures DIDA schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para el registro y allocator de IDs documentales. Los registros y
commits son lógicos; este catálogo no crea el registry ni asigna números reales.

## Formato

```yaml
id: DIDA-FIX-NNN
kind: POSITIVE | NEGATIVE | CONCURRENCY | MIGRATION | DETERMINISM
input:
  registry: <estado lógico>
  allocation: <request o null>
  envelopes: [<records>]
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  codes: [DIDAxxx]
```

`N` representa el primer valor aprobado durante inicialización; no equivale necesariamente a 1.

## Inicialización y asignación válidas

### DIDA-FIX-001 — Inicialización vacía

Namespace/path/schema aprobados, historia revisada, `initialValue: N`, snapshot y DOC-REV válidos.

Expected: `ACCEPT`; registrar baseline sin allocation todavía.

### DIDA-FIX-002 — Primera allocation

Registro vacío inicializado en `N`, request quantity 2, mappings ordenados.

Expected: asigna `N` y `N+1` atómicamente; entries/envelopes coinciden.

### DIDA-FIX-003 — Allocation posterior

Máximo histórico `N+4`, con gaps/tombstones anteriores.

Expected: siguiente ID `N+5`; no rellena gaps.

### DIDA-FIX-004 — Batch determinista

Mappings llegan desordenados y se normalizan por mapping ID.

Expected: mismos IDs por mapping independientemente del orden de input.

### DIDA-FIX-005 — Draft válido

Entry/envelope `DRAFT`, owner `UNASSIGNED`, sin effective commit, mapping/review de allocation
válidos.

Expected: `ACCEPT`; no se promueve a `ACTIVE`.

### DIDA-FIX-006 — Active válido

Entry/envelope coinciden, owner/review/effective commit presentes.

Expected: `ACCEPT`.

### DIDA-FIX-007 — Move atómico

Mismo ID, canonicalPath nuevo, alias `PREVIOUS_PATH`, envelope/consumers actualizados.

Expected: `ACCEPT`.

### DIDA-FIX-008 — Alias temporal

`LEGACY_PATH` tiene `validFrom/validUntil` coherentes y no colisiona.

Expected: `ACCEPT`.

### DIDA-FIX-009 — Supersession

Source `SUPERSEDED`, successor existente/activo, DAG acíclico.

Expected: `ACCEPT`.

### DIDA-FIX-010 — Retirement

Documento `RETIRED` con decisión aprobada y sin successor.

Expected: `ACCEPT`; ID permanece ocupado.

### DIDA-FIX-011 — Tombstone

ID publicado/reservado externamente no posee contenido activo, pero conserva razón/evidence.

Expected: `ACCEPT`; allocator lo salta.

### DIDA-FIX-012 — Rollback antes de publicación

Transacción falla sin commit ni registro externo.

Expected: `ACCEPT`; no hay entry/tombstone y los números nunca fueron asignados.

### DIDA-FIX-013 — Rollback después de publicación

Se retira documento mediante commit revisado.

Expected: entry histórica/tombstone preserva ID; no se reutiliza.

## Registry, IDs y consistencia

### DIDA-FIX-014 — Schema/path inválido

Versión desconocida, registry en path no aprobado o YAML inseguro.

Expected: `REJECT [DIDA001]`.

### DIDA-FIX-015 — Dos registries autoritativos

Expected: `REJECT [DIDA001]`; no se fusionan por precedencia implícita.

### DIDA-FIX-016 — ID malformado

Ancho incorrecto, case distinto, sufijo no decimal o namespace ajeno.

Expected: `REJECT [DIDA002]`.

### DIDA-FIX-017 — ID duplicado

Dos entries reclaman el mismo ID.

Expected: `REJECT [DIDA002]`.

### DIDA-FIX-018 — Reutilización

ID retirado/tombstone se asigna a otro documento.

Expected: `REJECT [DIDA002]`.

### DIDA-FIX-019 — Entry sin envelope

Entry no histórica apunta a documento sin envelope.

Expected: `REJECT [DIDA003]`.

### DIDA-FIX-020 — Envelope sin entry

Expected: `REJECT [DIDA003]`.

### DIDA-FIX-021 — Entry/envelope drift

Path, specRef, role, status o documentId difieren.

Expected: `REJECT [DIDA003]`.

### DIDA-FIX-022 — Path inexistente

Entry activa apunta a path ausente en subject commit.

Expected: `REJECT [DIDA003]`.

## Requests y concurrencia

### DIDA-FIX-023 — Quantity/mappings no cierran

Quantity 2 con uno o tres mappings/assigned IDs.

Expected: `REJECT [DIDA004]`.

### DIDA-FIX-024 — Request proposed con IDs

Una request `PROPOSED` ya contiene assigned IDs.

Expected: `REJECT [DIDA004]`; no reserva números.

### DIDA-FIX-025 — Mapping duplicado

Mismo mapping/path aparece dos veces.

Expected: `REJECT [DIDA004]`.

### DIDA-FIX-026 — Dos requests mismo baseline

Primera se aplica; segunda intenta aplicar IDs calculados sobre el mismo hash.

Expected: segunda `MARK_STALE [DIDA005]`.

### DIDA-FIX-027 — Registry cambia sin solapamiento aparente

Otro batch agrega IDs antes de aplicar request.

Expected: `MARK_STALE [DIDA005]`; debe recalcular aunque paths sean distintos.

### DIDA-FIX-028 — Lock vigente pero hash stale

Expected: `MARK_STALE [DIDA005]`; el lock no reemplaza compare-and-swap.

### DIDA-FIX-029 — Relleno de gap

Máximo 10, ID 8 libre por historia parcial; allocator elige 8.

Expected: `REJECT [DIDA006]`.

### DIDA-FIX-030 — Máximo ignora tombstone

Tombstone 12, máximo activo 10; allocator elige 11.

Expected: `REJECT [DIDA006]`; debe comenzar después de 12.

### DIDA-FIX-031 — Asignación depende del filesystem

Mismos mappings en distinto orden reciben IDs diferentes.

Expected: `REJECT [DIDA006]`.

## Aliases, moves, split y merge

### DIDA-FIX-032 — Alias duplicado vigente

Dos IDs reclaman el mismo path durante periodos solapados.

Expected: `REJECT [DIDA007]`.

### DIDA-FIX-033 — Periodo de alias inválido

`validUntil < validFrom` o commits no pertenecen a historia evaluada.

Expected: `REJECT [DIDA007]`.

### DIDA-FIX-034 — Alias como segundo documento

Se crea entry/envelope independiente sólo para un alias.

Expected: `REJECT [DIDA007]`.

### DIDA-FIX-035 — Move parcial

Canonical path cambia sin alias, envelope o consumers.

Expected: `REJECT [DIDA008]`.

### DIDA-FIX-036 — Split hereda ID arbitrariamente

Un hijo conserva ID source sin decisión de continuidad.

Expected: `REJECT [DIDA008]`.

### DIDA-FIX-037 — Split válido

Source superseded y dos IDs nuevos con mapping por fragmento/successors.

Expected: `ACCEPT`.

### DIDA-FIX-038 — Merge ambiguo

Documento combinado conserva un ID source sin decision/review.

Expected: `REJECT [DIDA008]`.

### DIDA-FIX-039 — Merge válido

Nuevo ID para combinado, dos sources superseded con successor común.

Expected: `ACCEPT`.

## Historia, review, seguridad y versiones

### DIDA-FIX-040 — Superseded sin successor

Expected: `REJECT [DIDA009]`.

### DIDA-FIX-041 — Successor cíclico

Expected: `REJECT [DIDA009]`.

### DIDA-FIX-042 — Tombstone sin razón/evidence

Expected: `REJECT [DIDA009]`.

### DIDA-FIX-043 — Retired reutilizado después

Expected: `REJECT [DIDA002, DIDA009]`.

### DIDA-FIX-044 — Aplicación parcial

Registry/IDs publicados sin todos los envelopes o mappings.

Expected: `REJECT [DIDA010]`.

### DIDA-FIX-045 — Reviewer/assignment inválido

Allocation aplicada con owner/reviewer sin aceptar, review stale o self-review prohibido.

Expected: `REJECT [DIDA010]`.

### DIDA-FIX-046 — Active prematuro

Entry/envelope se promueven sin review/effective commit.

Expected: `REJECT [DIDA010]`.

### DIDA-FIX-047 — Path sensible

Path absoluto, traversal, `.env`, key material o credential export.

Expected: `REJECT [DIDA011]`; no leer/copiar contenido sensible.

### DIDA-FIX-048 — PII/secret en metadata

Expected: `REJECT [DIDA011]`; redacción sin persistir valor/hash secreto.

### DIDA-FIX-049 — Reader versión desconocida

Expected: `REJECT [DIDA012]`.

### DIDA-FIX-050 — Orden variable

Mismo registry enumerado en distinto orden.

Expected: serialización canónica byte-idéntica; de lo contrario `REJECT [DIDA012]`.

### DIDA-FIX-051 — Registry drift post-review

Hash/entry cambia después del DOC-REV.

Expected: `MARK_STALE [DIDA005, DIDA012]`.

### DIDA-FIX-052 — Ampliación de ancho

Namespace excede cinco dígitos sin nueva schemaVersion/migración.

Expected: `REJECT [DIDA012]`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| inicialización/asignación | 001–006, 012–013 |
| registry/identidad | 014–022 |
| requests/concurrencia | 023–031, 051 |
| aliases/moves | 007–008, 032–035 |
| split/merge | 036–039 |
| lifecycle/tombstones | 009–013, 040–043 |
| review/seguridad/versiones | 044–052 |

Todos los códigos `DIDA001`–`DIDA012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Inicialización parametrizada sin elegir primer número.
- [x] Asignación, concurrencia, aliases y lifecycle cubiertos.
- [x] Split, merge, rollback y tombstones cubiertos.
- [x] Doce códigos cubiertos.
- [ ] Materializar registries/requests/expected outputs.
- [ ] Aprobar schema/path/initial value mediante DOC-REV.
- [ ] Implementar allocator sólo después de aprobación.

Los últimos tres checks permanecen abiertos.
