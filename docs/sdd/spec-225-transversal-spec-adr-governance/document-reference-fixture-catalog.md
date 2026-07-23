# Catálogo de fixtures DREF schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para referencias documentales tipadas y su resolución offline.
Este catálogo no modifica envelopes, registros ni mappings.

## Formato

```yaml
id: DREF-FIX-NNN
kind: POSITIVE | NEGATIVE | MIGRATION | LIFECYCLE | DETERMINISM
input:
  source: <document/ref field>
  registries: <snapshots lógicos>
  reference: <typed o legacy ref>
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  resolution: <outcome o null>
  codes: [DREFxxx]
```

## Referencias válidas

### DREF-FIX-001 — Document active

`DOCUMENT/GOVERNED_BY/ACTIVE_REVISION`, ID registrado y activo.

Expected: `ACCEPT/RESOLVED`.

### DREF-FIX-002 — Spec active

`SPEC/GOVERNED_BY/ACTIVE_REVISION`, SPEC existente.

Expected: `ACCEPT/RESOLVED`.

### DREF-FIX-003 — ADR pinned

`ADR/GOVERNED_BY/PINNED_COMMIT`, SHA completo y revisión existente.

Expected: `ACCEPT/RESOLVED`.

### DREF-FIX-004 — Derived from document revision

`DOCUMENT/DERIVED_FROM/PINNED_COMMIT`.

Expected: `ACCEPT`; output histórico sigue reproducible aunque target activo avance.

### DREF-FIX-005 — Derived from artifact

`ARTIFACT/DERIVED_FROM/PINNED_ARTIFACT`, registry ID/hash coinciden.

Expected: `ACCEPT`.

### DREF-FIX-006 — Commit input

`COMMIT/DERIVED_FROM/PINNED_COMMIT`, SHA completo disponible.

Expected: `ACCEPT`.

### DREF-FIX-007 — Navigates to

`DOCUMENT/NAVIGATES_TO/ACTIVE_REVISION`.

Expected: `ACCEPT`; crea edge de navegación, no autoridad.

### DREF-FIX-008 — Historical pinned

Target retired/superseded, pero ref fija commit histórico existente.

Expected: `ACCEPT/RESOLVED_HISTORICAL`.

### DREF-FIX-009 — Move transparente

Document ID conserva identidad, canonical path cambia y alias es válido.

Expected: `ACCEPT/RESOLVED`; source ref no cambia.

### DREF-FIX-010 — Revisión compatible

`ACTIVE_REVISION` resuelve nueva revisión compatible del mismo ID.

Expected: `ACCEPT/RESOLVED`.

## Legacy mappings válidos

### DREF-FIX-011 — Allocate document ID

Legacy path + blob/commit, target inequívoco y allocation/review válidos.

Expected: `ACCEPT`; mapping produce ref `DOCUMENT`.

### DREF-FIX-012 — Collapse to spec

Path sólo representaba owner spec; review demuestra ausencia de autoridad exclusiva.

Expected: `ACCEPT`; mapping produce ref `SPEC`.

### DREF-FIX-013 — Remove navigation ref

Path era sólo navegación y link permanece en body.

Expected: `ACCEPT`; se retira de authorityRefs sin perder autoridad.

### DREF-FIX-014 — Blocked

Target ambiguo/ownership pendiente, strategy `BLOCKED`, finding identificado.

Expected: `ACCEPT` como mapping draft; no puede aplicarse a envelope activo.

## Schema, tipos y targets inválidos

### DREF-FIX-015 — Schema/type/relation desconocido

Expected: `REJECT [DREF001]`.

### DREF-FIX-016 — Mode incompatible

`ACTIVE_REVISION` con revisionRef o `PINNED_COMMIT` sin SHA.

Expected: `REJECT [DREF001]`.

### DREF-FIX-017 — Relation incompatible

`SPEC/DERIVED_FROM/PINNED_ARTIFACT` o `COMMIT/GOVERNED_BY`.

Expected: `REJECT [DREF001]`.

### DREF-FIX-018 — ID malformado

Expected: `REJECT [DREF002]`.

### DREF-FIX-019 — Type mismatch

`refType: SPEC`, `refId: ADR-002`.

Expected: `REJECT [DREF002]`.

### DREF-FIX-020 — URL/título como ID

Expected: `REJECT [DREF002]`.

### DREF-FIX-021 — Target missing

ID sintácticamente válido no existe en registry del subject commit.

Expected: `REJECT [DREF003]`, resolution `TARGET_MISSING`.

### DREF-FIX-022 — Path inseguro durante legacy mapping

Path absoluto/traversal/fuera del repository.

Expected: `REJECT [DREF003]`.

### DREF-FIX-023 — Registry no disponible

Resolver intenta fallback por filename/title.

Expected: `REJECT [DREF003]`; no inventa target.

## Revision y lifecycle

### DREF-FIX-024 — SHA corto

Expected: `REJECT [DREF004]`.

### DREF-FIX-025 — Hash artifact no coincide

Expected: `REJECT [DREF004]`, resolution `STALE_REVISION`.

### DREF-FIX-026 — Revision ausente

Commit/hash no existe en snapshot/registry.

Expected: `REJECT [DREF004]`.

### DREF-FIX-027 — Active revision incompatible

Target avanzó con cambio incompatible.

Expected: `MARK_STALE [DREF004]`; requiere revisión consumer.

### DREF-FIX-028 — Target retired activo

Ref `ACTIVE_REVISION` apunta a target `RETIRED`.

Expected: `REJECT [DREF005]`, resolution `TARGET_RETIRED`; no sigue successor automáticamente.

### DREF-FIX-029 — Expected status drift

Ref esperaba `ACTIVE`, target está `DEPRECATED`.

Expected: `MARK_STALE [DREF005]`.

### DREF-FIX-030 — Superseded con successor

Ref activa encuentra target superseded.

Expected: `MARK_STALE [DREF005]`; reporta successor sin reescribir.

## Cardinalidad y legacy reconciliation

### DREF-FIX-031 — Derived sin generatedFrom

Expected: `REJECT [DREF006]`.

### DREF-FIX-032 — Successor no document

Expected: `REJECT [DREF006]`.

### DREF-FIX-033 — Authority field usa commit

Expected: `REJECT [DREF006]`.

### DREF-FIX-034 — Legacy path sin blob/commit

Expected: `REJECT [DREF007]`.

### DREF-FIX-035 — Legacy path sin estrategia

Expected: `REJECT [DREF007]`.

### DREF-FIX-036 — Legacy path persiste en envelope active

Expected: `REJECT [DREF007]`.

### DREF-FIX-037 — Collapse pierde autoridad

Documento especializado contenía obligación exclusiva y se reemplaza sólo por SPEC owner.

Expected: `REJECT [DREF008]`.

### DREF-FIX-038 — Remove pierde autoridad

Ref se clasifica navegación aunque era única fuente normativa.

Expected: `REJECT [DREF008]`.

### DREF-FIX-039 — Allocate por similitud

Target elegido por basename/heading parecido sin identidad/hash inequívocos.

Expected: `REJECT [DREF008]`.

## Grafo, drift y seguridad

### DREF-FIX-040 — Cycle governed-by

Dos documents se gobiernan mutuamente sin autoridad superior/excepción.

Expected: `REJECT [DREF009]`.

### DREF-FIX-041 — Cycle derived-from

Expected: `REJECT [DREF009]`.

### DREF-FIX-042 — Cycle navigation

Dos READMEs se enlazan mutuamente.

Expected: `ACCEPT`; `NAVIGATES_TO` cycle no es authority cycle.

### DREF-FIX-043 — Registry drift

Mismos refs, registry hash cambia después del reporte/review.

Expected: `MARK_STALE [DREF010]`.

### DREF-FIX-044 — Orden variable

Mismas refs/registries en distinto orden.

Expected: report byte-idéntico y orden canónico; de lo contrario `REJECT [DREF010]`.

### DREF-FIX-045 — Resolución no determinista

Misma identity produce targets distintos según filesystem/order.

Expected: `REJECT [DREF010]`.

### DREF-FIX-046 — Signed URL o secret

Expected: `REJECT [DREF011]`; no persistir valor/hash secreto.

### DREF-FIX-047 — Email/path absoluto

Expected: `REJECT [DREF011]`.

### DREF-FIX-048 — Supersession sin mapping/review

Source ref se cambia a successor sin decisión/review.

Expected: `REJECT [DREF012]`.

### DREF-FIX-049 — Migration aplicada con blocked

Envelope se activa mientras legacy ref sigue `BLOCKED`.

Expected: `REJECT [DREF012]`.

### DREF-FIX-050 — Review stale

Mapping/reconciliation aprobado sobre otro commit/blob/schema.

Expected: `MARK_STALE [DREF012]`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| referencias válidas | 001–010 |
| legacy strategies | 011–014, 034–039 |
| schema/tipo/target | 015–023 |
| revision/lifecycle | 024–030 |
| cardinalidad | 031–033 |
| grafo/drift | 040–045 |
| seguridad/migration | 046–050 |

Todos los códigos `DREF001`–`DREF012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Tipos, relations y resolution modes cubiertos.
- [x] Cuatro estrategias legacy cubiertas.
- [x] Lifecycle, cycles, drift y seguridad cubiertos.
- [x] Doce códigos cubiertos.
- [ ] Materializar registries/refs/expected reports.
- [ ] Aprobar schema/catalog mediante DOC-REV.
- [ ] Implementar resolver sólo después de aprobación.

Los últimos tres checks permanecen abiertos.
