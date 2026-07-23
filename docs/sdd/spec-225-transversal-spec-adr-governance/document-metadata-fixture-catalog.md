# Catálogo de fixtures DOCM schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para el envelope de metadata documental. Este catálogo no agrega
front matter a documentos reales ni implementa parser/validator.

## Formato

```yaml
id: DOCM-FIX-NNN
kind: POSITIVE | NEGATIVE | MIGRATION | DETERMINISM
input: <archivo/registro/mapping lógico>
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  codes: [DOCMxxx]
```

Los SHAs, hashes, assignment refs y review IDs simbólicos se reemplazan por valores válidos al
materializar fixtures.

## Envelopes válidos

### DOCM-FIX-001 — Authoritative draft

Envelope v1, ID único, specRef coherente, role `AUTHORITATIVE`, status `DRAFT`, owner
`UNASSIGNED`, sin `effectiveFrom`.

Expected: `ACCEPT`; puede ser propuesta, no `ACTIVE`.

### DOCM-FIX-002 — Authoritative active

Owner aceptado, authority scope, DOC-REV y commit efectivo.

Expected: `ACCEPT`; status documental no cambia readiness de la spec.

### DOCM-FIX-003 — Derived

`generatedFrom` contiene inputs versionados y procedimiento/tool exacto.

Expected: `ACCEPT`.

### DOCM-FIX-004 — Evidence

Subject/commit/environment/outcome conformes al contrato de evidence aplicable.

Expected: `ACCEPT`; un template `NOT_RUN` puede tener role `EVIDENCE` pero no outcome `PASS`.

### DOCM-FIX-005 — Audit

Scope, corte y provenance presentes; authorityRefs apuntan a fuentes.

Expected: `ACCEPT`; no sobrescribe fuentes autoritativas.

### DOCM-FIX-006 — Migration

Mappings source/target, estado temporal, rollback y review refs válidos.

Expected: `ACCEPT`.

### DOCM-FIX-007 — Guide

Authority refs presentes y cero requisito exclusivo detectable.

Expected: `ACCEPT`.

### DOCM-FIX-008 — Historical

Razón de preservación y successor/retirement ref.

Expected: `ACCEPT`.

### DOCM-FIX-009 — Superseded

Successor existente, acíclico y efectivo.

Expected: `ACCEPT`.

### DOCM-FIX-010 — Root transversal

Documento bajo `docs/sdd/`, `specRef: null`, ID único y authorityRefs globales.

Expected: `ACCEPT`.

### DOCM-FIX-011 — Movimiento

Path cambia, documentId y contenido se conservan, registro/consumers se actualizan.

Expected: `ACCEPT`; identidad no deriva del path.

### DOCM-FIX-012 — Front matter con body LF intacto

Source UTF-8 sin BOM y LF-only. Aplicar envelope cambia sólo bytes iniciales; body hash exacto
coincide con mapping.

Expected: `ACCEPT`; cero cambio semántico del body.

## Presencia y serialización

### DOCM-FIX-013 — Envelope requerido ausente

Schema activo y nuevo Markdown tracked sin front matter.

Expected: `REJECT [DOCM001]`.

### DOCM-FIX-014 — Legacy durante transición

Schema todavía no activo; artifact figura en baseline/mapping como `LEGACY_UNCLASSIFIED`.

Expected: `ACCEPT` en modo migratorio con deuda visible; no cuenta como canónico.

### DOCM-FIX-015 — Front matter después del heading

Expected: `REJECT [DOCM002]`.

### DOCM-FIX-016 — Dos envelopes

Expected: `REJECT [DOCM002]`.

### DOCM-FIX-017 — YAML inseguro

Tags, aliases, merge keys o tipos arbitrarios.

Expected: `REJECT [DOCM002]`; parser no ejecuta/resuelve construcciones.

### DOCM-FIX-018 — Campos desconocidos

Schema v1 contiene campo no permitido.

Expected: `REJECT [DOCM002]`, salvo espacio de extensiones aprobado explícitamente.

## Identidad y ownership de spec

### DOCM-FIX-019 — ID inválido

Formato incorrecto o número fuera de registro.

Expected: `REJECT [DOCM003]`.

### DOCM-FIX-020 — ID duplicado

Dos paths activos declaran el mismo documentId sin relación de movimiento atómico.

Expected: `REJECT [DOCM003]`.

### DOCM-FIX-021 — ID retirado reutilizado

Expected: `REJECT [DOCM003]`.

### DOCM-FIX-022 — specRef incompatible

Artifact bajo SPEC-225 declara SPEC-226 sin mapping cross-owner.

Expected: `REJECT [DOCM004]`.

### DOCM-FIX-023 — Cross-spec con múltiples owners

Se intenta guardar lista de specRefs en lugar de owner spec única + authorityRefs.

Expected: `REJECT [DOCM004]`.

### DOCM-FIX-024 — Registro/path drift

Registry localiza documentId en otro path y no existe move mapping.

Expected: `REJECT [DOCM004]`.

## Roles, status y campos condicionados

### DOCM-FIX-025 — Role/status desconocido

Expected: `REJECT [DOCM005]`.

### DOCM-FIX-026 — Template como active evidence

Record `NOT_RUN` declara resultado efectivo o evidence `PASS`.

Expected: `REJECT [DOCM005]`.

### DOCM-FIX-027 — Guide introduce autoridad

Único requisito normativo existe sólo en GUIDE.

Expected: `REJECT [DOCM005]`; requiere mover autoridad o reclasificar con review.

### DOCM-FIX-028 — Derived sin provenance

`generatedFrom` vacío o tool no versionado.

Expected: `REJECT [DOCM006]`.

### DOCM-FIX-029 — Active authoritative sin owner

Expected: `REJECT [DOCM006]`.

### DOCM-FIX-030 — Audit sin scope/corte

Expected: `REJECT [DOCM006]`.

### DOCM-FIX-031 — Superseded sin successor

Expected: `REJECT [DOCM007]`.

### DOCM-FIX-032 — Successor inexistente o cíclico

Expected: `REJECT [DOCM007]`.

### DOCM-FIX-033 — Retired sin retiro aprobado

Successor puede ser nulo, pero falta retirement decision/ref.

Expected: `REJECT [DOCM007]`.

### DOCM-FIX-034 — Active sin review/effective commit

Expected: `REJECT [DOCM008]`.

### DOCM-FIX-035 — Review stale

Review refiere otro commit/blob/schema.

Expected: `REJECT [DOCM008]`.

### DOCM-FIX-036 — DRAFT con effectiveFrom

Expected: `REJECT [DOCM008]`; un draft no es efectivo.

## Migraciones e identidad compuesta

### DOCM-FIX-037 — Split válido

Un legacy se divide en dos IDs nuevos con mapping completo, contenido reconciliado y review.

Expected: `ACCEPT`.

### DOCM-FIX-038 — Split sin mapping

Dos IDs aparecen desde un legacy sin trazabilidad de fragmentos.

Expected: `REJECT [DOCM009]`.

### DOCM-FIX-039 — Merge ambiguo

Dos legacy se fusionan y se conserva uno de sus IDs sin decisión de identidad.

Expected: `REJECT [DOCM009]`.

### DOCM-FIX-040 — Move parcial

Archivo cambia de path, registry o consumers quedan stale.

Expected: `REJECT [DOCM009]`.

## Ratchet, seguridad y compatibilidad

### DOCM-FIX-041 — Canonical vuelve a legacy

Se retira envelope de documento previamente migrado.

Expected: `REJECT [DOCM010]`.

### DOCM-FIX-042 — Deuda crece después de activación

Nuevo tracked Markdown sin envelope.

Expected: `REJECT [DOCM001, DOCM010]`.

### DOCM-FIX-043 — Orden variable

Misma metadata con arrays no semánticos/keys en distinto orden.

Expected: serialización canónica byte-idéntica; de lo contrario `REJECT [DOCM010]`.

### DOCM-FIX-044 — Secret/PII en metadata

Token, credential, URL firmada, email personal o path privado.

Expected: `REJECT [DOCM011]`; redacción sin persistir valor/hash sensible.

### DOCM-FIX-045 — Path absoluto

Metadata contiene path local absoluto.

Expected: `REJECT [DOCM011]`.

### DOCM-FIX-046 — Versión desconocida

Reader v1 recibe schemaVersion 2.

Expected: `REJECT [DOCM012]`; no intenta best-effort.

### DOCM-FIX-047 — Upgrade incompatible en sitio

Enum/semántica cambia sin nueva schemaVersion/mapping.

Expected: `REJECT [DOCM012]`.

### DOCM-FIX-048 — Upgrade compatible

Nueva revisión agrega campo opcional con default inequívoco, fixtures previas pasan y review existe.

Expected: `ACCEPT`; document IDs/status no cambian.

### DOCM-FIX-049 — Cambio concurrente

Body/blob cambia después de mapping y antes de aplicar envelope.

Expected: `MARK_STALE [DOCM009]`; crear successor del mapping, no aplicar sobre bytes nuevos.

### DOCM-FIX-050 — Fenced example

Documento contiene ejemplo completo de front matter dentro de code fence, pero no envelope inicial.

Expected: sigue `LEGACY_UNCLASSIFIED`; bajo schema activo `REJECT [DOCM001]`, nunca falso positivo.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| roles válidos | 001–012 |
| presencia/serialización | 013–018, 043, 050 |
| identidad/specRef | 019–024 |
| roles/status/refs | 025–036 |
| migration/split/merge/move | 011–012, 037–040, 049 |
| ratchet/security/versiones | 041–048 |

Todos los códigos `DOCM001`–`DOCM012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Casos positivos, negativos, migración y determinismo especificados.
- [x] Siete roles y cinco estados documentales cubiertos.
- [x] Split, merge, move, staleness y ratchet cubiertos.
- [x] Doce códigos cubiertos.
- [ ] Materializar fixtures y expected outputs.
- [ ] Aprobar schema/catalog mediante DOC-REV.
- [ ] Implementar parser/validator sólo después de aprobación.

Los últimos tres checks permanecen abiertos.
