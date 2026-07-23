# Catálogo de fixtures DOC-REV schema v1 — SPEC-225

## Formato

```yaml
id: DREV-FIX-NNN
kind: POSITIVE | NEGATIVE
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  codes: [DREVxxx]
```

## Códigos

| Código | Condición |
| --- | --- |
| `DREV001` | schema/reviewId/subject inválido |
| `DREV002` | commit/path/hash inválido o duplicado |
| `DREV003` | dimensión requerida ausente |
| `DREV004` | outcome de dimensión sin evidencia/finding |
| `DREV005` | outcome global contradice dimensiones |
| `DREV006` | reviewer sin assignment aceptado/vigente |
| `DREV007` | self-review o conflicto prohibido |
| `DREV008` | finding/excepción incompleto |
| `DREV009` | record stale por cambio de commit/path/schema |
| `DREV010` | supersession inválida o cíclica |
| `DREV011` | contenido sensible |
| `DREV012` | serialización no determinista |

## Casos positivos

### DREV-FIX-001 — Approve documental válido

Subject `SCHEMA`, paths/hashes completos, dimensiones requeridas `PASS`, reviewer con assignment
`ACCEPTED`, outcome `APPROVE`.

Expected: `ACCEPT`; no modifica lifecycle ni genera `ImplementationEvidence`.

### DREV-FIX-002 — Request changes

Una dimensión `FAIL` enlaza finding con ubicación y resolución; outcome global
`REQUEST_CHANGES`.

Expected: `ACCEPT`.

### DREV-FIX-003 — Blocked por owner

Dimensión requerida `INCONCLUSIVE`, blocker `OWN-NNN`, reviewer registra `BLOCKED`.

Expected: `ACCEPT`; no se interpreta como rechazo semántico.

### DREV-FIX-004 — Not applicable justificado

Subject `FIXTURE_CATALOG`; `REV-API` es `NOT_APPLICABLE` con reason/evidence ref.

Expected: `ACCEPT`.

### DREV-FIX-005 — Review de snapshot

Subject `SNAPSHOT`, paths del manifest y hashes, dimensiones Scope/Security/Traceability pasan.

Expected: `ACCEPT`; habilita freeze sólo si también cumple contrato SNAP.

### DREV-FIX-006 — Review final de batch

Subject `MIGRATION_BATCH`, mappings/ratchet/diff incluidos, outcome `APPROVE`.

Expected: `ACCEPT`; no aprueba implementación de la spec.

### DREV-FIX-007 — Supersession válida

Nuevo record referencia uno anterior, mismo subject y commit/path actualizados, sin ciclo.

Expected: `ACCEPT`; el record previo permanece inmutable/histórico.

## Casos negativos

### DREV-FIX-008 — Approve con FAIL

Expected: `REJECT [DREV005]`.

### DREV-FIX-009 — Approve con INCONCLUSIVE requerido

Expected: `REJECT [DREV005]`.

### DREV-FIX-010 — Fail sin finding

Expected: `REJECT [DREV004]`.

### DREV-FIX-011 — Reviewer UNASSIGNED

Expected: `REJECT [DREV006]`.

### DREV-FIX-012 — Assignment expirado

Expected: `REJECT [DREV006]`.

### DREV-FIX-013 — Autor único se autoaprueba

Subject crítico; reviewer y autor son la misma identidad sin segregación permitida.

Expected: `REJECT [DREV007]`.

### DREV-FIX-014 — Conflicto no declarado

Existe custodia/provider/autoría material conocida y `conflicts: []`.

Expected: `REJECT [DREV007]`.

### DREV-FIX-015 — Commit corto o path duplicado

Expected: `REJECT [DREV002]`.

### DREV-FIX-016 — Path cambió después del review

Expected: `MARK_STALE [DREV009]`; no muta record anterior.

### DREV-FIX-017 — Checklist/schema cambió

La dimensión normativa aplicable cambió después de emitir review.

Expected: `MARK_STALE [DREV009]`.

### DREV-FIX-018 — Supersession cíclica

Expected: `REJECT [DREV010]`.

### DREV-FIX-019 — Excepción sin vencimiento

Finding crítico aceptado sin owner, mitigación o `expiresAt`.

Expected: `REJECT [DREV008]`.

### DREV-FIX-020 — Secret en evidence ref embebida

Record incluye token/credencial en vez de referencia segura.

Expected: `REJECT [DREV011]` y salida redactada.

### DREV-FIX-021 — Orden variable

Mismo record con paths/dimensiones/refs desordenados.

Expected: normalización produce bytes idénticos; de lo contrario `REJECT [DREV012]`.

### DREV-FIX-022 — Subject desconocido

Expected: `REJECT [DREV001]`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| outcomes | 001–004, 008–010 |
| subjects | 001, 004–006, 022 |
| reviewer/conflicts | 001–003, 011–014 |
| revision/staleness | 007, 015–018 |
| findings/excepciones | 002–003, 010, 019 |
| seguridad/determinismo | 020–021 |

## Criterios de salida

- [x] Casos positivos y negativos especificados.
- [x] Doce códigos definidos.
- [x] Approval, bloqueo, self-review y staleness cubiertos.
- [ ] Fixtures ejecutables creadas.
- [ ] DOC-REV validator implementado.
- [ ] Governance/Architecture aprueban catálogo.

Los últimos tres checks permanecen abiertos.
