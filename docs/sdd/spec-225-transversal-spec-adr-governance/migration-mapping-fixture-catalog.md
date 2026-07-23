# Catálogo de fixtures del mapping schema v1 — SPEC-225

## Convenciones

Cada fixture define:

```yaml
id: MAP-FIX-NNN
kind: POSITIVE | NEGATIVE
input: <documento/fragmento>
expected:
  outcome: ACCEPT | REJECT
  codes: [MAPxxx]
  normalized: <salida cuando aplica>
```

Los ejemplos usan hashes simbólicos (`sha256:<name>`) para legibilidad. La implementación futura
reemplaza símbolos por 64 hexadecimales en fixtures ejecutables.

## Códigos

| Código | Condición |
| --- | --- |
| `MAP001` | schemaVersion ausente/desconocida |
| `MAP002` | batchId/artifactType inválido |
| `MAP003` | baseline commit/hash inválido |
| `MAP004` | locator/text hash ausente |
| `MAP005` | clasificación incompatible con targets |
| `MAP006` | alias duplicado o con tipo inválido |
| `MAP007` | split/merge incompleto |
| `MAP008` | conflict sin impacto/owner/evidencia |
| `MAP009` | edge usa tipos/dirección inválidos |
| `MAP010` | check marcado promovido sin evidencia |
| `MAP011` | documento/fragmento stale |
| `MAP012` | orden/serialización no determinista |
| `MAP013` | contenido sensible prohibido |
| `MAP014` | review/outcome inconsistente |

## Fixtures positivas

### MAP-FIX-001 — Preserve simple

Input: una regla legacy atómica se mapea a un único `SPEC-225-RULE-001`, sin cambio semántico.

Expected:

```yaml
outcome: ACCEPT
classification: PRESERVE
targets: [SPEC-225-RULE-001]
```

### MAP-FIX-002 — Split uno a varios

Input: un bullet combina validación de ID y autorización. Produce `REQ-001` y `REQ-002` con reason
que identifica boundaries/evidencia independientes.

Expected: `ACCEPT`; ambos targets presentes, mismo source hash y razón no vacía.

### MAP-FIX-003 — Merge varios a uno

Input: dos párrafos equivalentes de specification/rules apuntan a `SPEC-225-REQ-003`, con decision
ref que elige autoridad.

Expected: `ACCEPT`; dos entries ordenadas, target común y ninguna fuente eliminada del mapping.

### MAP-FIX-004 — Alias legacy

Input:

```yaml
canonical: SPEC-004-RULE-002
aliases: [BRA-002]
```

Expected: `ACCEPT`; alias resuelve exactamente a un target y se ordena lexicográficamente.

### MAP-FIX-005 — Contenido no normativo conservado

Input: ejemplo de payload clasificado `NON_NORMATIVE`, sin target normativo y con reason “ejemplo
ilustrativo; conservar en sección Examples”.

Expected: `ACCEPT`; no crea REQ/RULE y no implica borrado.

### MAP-FIX-006 — Edge cross-spec

Input:

```yaml
sourceId: SPEC-010-REQ-001
edge: CONSTRAINS
targetId: SPEC-004-BND-001
reason: API consume autoridad Branch
status: PROPOSED
```

Expected: `ACCEPT` si ambos IDs existen en el conjunto/baseline; no crea automáticamente dependencia
entre SPEC-010 y SPEC-004.

### MAP-FIX-007 — Check histórico sin evidencia

Input: checkbox `[x]` con hash/locator, sin evidence refs.

Expected:

```yaml
outcome: ACCEPT
classification: UNVERIFIED_DONE
findingId: <requerido>
```

La salida nunca contiene `EVIDENCED`.

## Fixtures negativas

### MAP-FIX-008 — Schema desconocido

Input: `schemaVersion: 2` cuando el reader soporta sólo v1.

Expected: `REJECT [MAP001]`; no intenta downgrade ni ignora campos.

### MAP-FIX-009 — Split incompleto

Input: `classification: SPLIT`, un solo target y reason vacío.

Expected: `REJECT [MAP007]`.

### MAP-FIX-010 — Alias ADR como regla

Input:

```yaml
targets: [SPEC-211-RULE-001]
aliases: [ADR-003]
```

Expected: `REJECT [MAP006]`; ADR conserva su tipo.

### MAP-FIX-011 — Alias duplicado

Input: `BRA-002` resuelve a dos RULE targets.

Expected: `REJECT [MAP006]`; reporta ambos destinos.

### MAP-FIX-012 — Conflict incompleto

Input: `classification: CONFLICT` con alternativas, pero sin impact, requiredEvidence ni owner.

Expected: `REJECT [MAP008]`.

### MAP-FIX-013 — Edge inválido

Input: `EVIDENCED_BY` desde evidencia hacia objetivo (dirección inversa).

Expected: `REJECT [MAP009]`.

### MAP-FIX-014 — Check promovido

Input: checkbox histórico marcado, sin artifact, clasificado `EVIDENCED`.

Expected: `REJECT [MAP010]`.

### MAP-FIX-015 — Fragmento stale

Input: `fileSha256` coincide con baseline, pero `textSha256` ya no coincide con heading/fragmento
seleccionado.

Expected: `REJECT [MAP011]`; exige regenerar mapping, no buscar texto parecido.

### MAP-FIX-016 — Orden no determinista

Input: mismos entries/refs en distinto orden.

Expected: normalización produce bytes idénticos; si el serializer no puede hacerlo,
`REJECT [MAP012]`.

### MAP-FIX-017 — Secret-like content

Input: excerpt contiene token/clave privada o valor de credencial.

Expected: `REJECT [MAP013]`; el resultado no reproduce el valor sensible.

### MAP-FIX-018 — Review inconsistente

Input: `status: ACCEPTED`, `review.outcome: PENDING` o `reviewedCommit: null`.

Expected: `REJECT [MAP014]`.

### MAP-FIX-019 — Hash de archivo inválido

Input: `fileSha256` simbólico/no hexadecimal en fixture ejecutable.

Expected: `REJECT [MAP003]`.

### MAP-FIX-020 — Clasificación sin target

Input: `PRESERVE` sin target, o `OUT_OF_SCOPE` con target canónico creado.

Expected: `REJECT [MAP005]`.

## Matriz de cobertura

| Regla | Fixtures |
| --- | --- |
| versionado | 008 |
| identidad/baseline/hash | 001, 015, 019 |
| preserve/split/merge | 001–003, 009, 020 |
| aliases | 004, 010–011 |
| non-normative/conflict | 005, 012 |
| edges | 006, 013 |
| checks legacy | 007, 014 |
| determinismo | 016 |
| seguridad | 017 |
| review | 018 |

## Criterios de salida

- [x] Casos positivos y negativos especificados.
- [x] Códigos de error definidos.
- [x] Cobertura de reglas mapeada.
- [ ] Fixtures ejecutables creadas.
- [ ] Validator implementado.
- [ ] Owner/reviewer aprueban schema y catálogo.

Los tres últimos checks permanecen abiertos.
