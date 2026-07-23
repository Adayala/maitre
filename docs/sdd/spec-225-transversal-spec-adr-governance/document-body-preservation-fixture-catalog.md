# Catálogo de fixtures DOCB schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para insertar/retirar envelopes preservando el body Markdown.
Los inputs son secuencias de bytes lógicas; este catálogo no transforma documentos reales.

## Formato

```yaml
id: DOCB-FIX-NNN
kind: POSITIVE | NEGATIVE | ROUND_TRIP | STALENESS | DETERMINISM
input:
  sourceBytes: <fixture ref + sha256>
  metadataRef: <mapping>
  mode: BYTE_PRESERVE_V1
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  codes: [DOCBxxx]
  bodyEqual: true | false
  roundTripEqual: true | false
```

Los expected outputs ejecutables deben incluir bytes y hashes completos, no sólo strings
normalizados.

## Inserciones válidas

### DOCB-FIX-001 — Heading inicial

Source UTF-8/LF comienza `# Título\n`.

Expected: envelope en byte 0, body comienza inmediatamente después de `---\n`, igualdad exacta.

### DOCB-FIX-002 — Blank line inicial

Source comienza `\n# Título\n`.

Expected: blank line permanece primer byte del body; no se elimina ni duplica.

### DOCB-FIX-003 — Sin trailing newline

Expected: target conserva body sin trailing newline; round-trip exacto.

### DOCB-FIX-004 — Body vacío

Source de cero bytes, permitido por fixture de transformación aunque DOCM pueda rechazar documento
vacío por otra regla.

Expected: inserción/extracción exactas; body length 0.

### DOCB-FIX-005 — Unicode

Body contiene español, diacríticos, emoji y caracteres multibyte válidos.

Expected: bytes UTF-8 idénticos.

### DOCB-FIX-006 — `---` en body

Reglas horizontales y fenced examples contienen delimitadores.

Expected: extractor sólo usa el cierre del envelope inicial; body íntegro.

### DOCB-FIX-007 — Front matter de ejemplo fenced

Body contiene bloque de código con `sddDocument`.

Expected: source se clasifica sin front matter; el ejemplo queda intacto.

### DOCB-FIX-008 — YAML con strings especiales

Metadata incluye título con `:`, `#`, quotes y Unicode.

Expected: envelope canónico/escapado, body intacto.

### DOCB-FIX-009 — Arrays desordenados

Refs no semánticas llegan en distinto orden.

Expected: envelope canónico igual; body no participa de esa normalización.

### DOCB-FIX-010 — Inserción repetida detectada

Target ya contiene envelope SDD válido.

Expected: operación idempotente de auditoría devuelve `ALREADY_PRESENT`; no inserta segundo
envelope ni modifica bytes.

## Remoción y round-trip

### DOCB-FIX-011 — Remoción válida

Target canónico producido desde source conocido.

Expected: remove devuelve source exacto.

### DOCB-FIX-012 — Insert/remove repetido

Dos ciclos con mismo metadata/source.

Expected: target bytes y source recuperado byte-idénticos en ambas repeticiones.

### DOCB-FIX-013 — Body comienza con delimiter

Source inicia `---\ncontenido`.

Expected: luego de retirar envelope, se recupera ese delimiter como body, sin confundirlo con un
segundo envelope.

### DOCB-FIX-014 — Body con final binario UTF-8 válido

Último carácter es multibyte y no hay newline.

Expected: length/hash exactos.

## Inputs/formato no soportado

### DOCB-FIX-015 — Schema/mode desconocido

Expected: `REJECT [DOCB001]`.

### DOCB-FIX-016 — Path inválido

Path absoluto, traversal o fuera del snapshot.

Expected: `REJECT [DOCB001]`; no leer destino.

### DOCB-FIX-017 — UTF-8 inválido

Expected: `REJECT [DOCB002]`; no reemplazar bytes con U+FFFD.

### DOCB-FIX-018 — BOM

Source comienza UTF-8 BOM.

Expected: `REJECT [DOCB002]` en `BYTE_PRESERVE_V1`; requiere mapping/modo futuro.

### DOCB-FIX-019 — CRLF

Expected: `REJECT [DOCB002]`; no convertir automáticamente a LF.

### DOCB-FIX-020 — Newlines mixtos

Expected: `REJECT [DOCB002]`.

### DOCB-FIX-021 — Foreign front matter

Source inicia YAML válido sin raíz `sddDocument`.

Expected: `REJECT [DOCB003]` con estado `BLOCKED_FOR_RECONCILIATION`; no merge automático.

### DOCB-FIX-022 — Front matter malformado

Expected: `REJECT [DOCB003]`.

### DOCB-FIX-023 — Doble front matter SDD

Expected: `REJECT [DOCB003]`; no elige primero/último.

## Envelope inválido

### DOCB-FIX-024 — Delimiter indentado

Expected: `REJECT [DOCB004]`.

### DOCB-FIX-025 — YAML inseguro

Anchor, alias, tag, merge key o múltiples documentos.

Expected: `REJECT [DOCB004]`.

### DOCB-FIX-026 — Clave raíz adicional

Envelope contiene `sddDocument` y otra raíz no permitida.

Expected: `REJECT [DOCB004]`.

### DOCB-FIX-027 — Orden/escaping no canónico

Metadata semánticamente igual produce envelope distinto.

Expected: `REJECT [DOCB004]` al validar target canónico.

## Hashes, body y diff

### DOCB-FIX-028 — Source hash falso

Expected: `REJECT [DOCB005]`.

### DOCB-FIX-029 — Length inconsistente

Expected: `REJECT [DOCB005]`.

### DOCB-FIX-030 — Body cambia un espacio

Expected: `REJECT [DOCB006]`.

### DOCB-FIX-031 — Trailing newline agregado

Expected: `REJECT [DOCB006]`.

### DOCB-FIX-032 — Unicode normalizado

Source NFD vuelve NFC.

Expected: `REJECT [DOCB006]`; equivalencia visual no basta.

### DOCB-FIX-033 — Round-trip pierde blank line

Expected: `REJECT [DOCB007]`.

### DOCB-FIX-034 — Round-trip altera delimiter del body

Expected: `REJECT [DOCB007]`.

### DOCB-FIX-035 — Corrección editorial incluida

Además del envelope cambia typo, heading, tabla o link.

Expected: `REJECT [DOCB008]`.

### DOCB-FIX-036 — Backlink incluido

El piloto agrega backlink junto al envelope.

Expected: `REJECT [DOCB008]`; mover a batch separado.

### DOCB-FIX-037 — Conversión de newline

Body LF se reserializa o normaliza.

Expected: `REJECT [DOCB008]`, además de `DOCB006` si cambian bytes.

## Staleness, determinismo, seguridad y lifecycle

### DOCB-FIX-038 — Source cambia

Hash/length cambia después de propuesta.

Expected: `MARK_STALE [DOCB009]`.

### DOCB-FIX-039 — Mapping/envelope cambia

Expected: `MARK_STALE [DOCB009]`.

### DOCB-FIX-040 — Snapshot/parser cambia

Expected: `MARK_STALE [DOCB009]`.

### DOCB-FIX-041 — Runs distintos

Mismos source/metadata/mode producen target/envelope hashes distintos.

Expected: `REJECT [DOCB010]`.

### DOCB-FIX-042 — Orden de archivos variable

Expected: results ordenados por path y payload byte-idéntico; de lo contrario
`REJECT [DOCB010]`.

### DOCB-FIX-043 — Secret en metadata/log

Expected: `REJECT [DOCB011]`; redacción sin persistir valor/hash secreto.

### DOCB-FIX-044 — Body sensible copiado al reporte

Reporte incluye contenido completo en lugar de hashes/refs.

Expected: `REJECT [DOCB011]`.

### DOCB-FIX-045 — ID sin allocation

Envelope contiene ID no presente en allocation/registry.

Expected: `REJECT [DOCB012]`.

### DOCB-FIX-046 — Registry/envelope drift

Expected: `REJECT [DOCB012]`.

### DOCB-FIX-047 — Aplicación sin review

Transformación propuesta puede auditarse, pero se aplica/publica sin DOC-REV.

Expected: `REJECT [DOCB012]`.

### DOCB-FIX-048 — Rollback post-publicación libera ID

Expected: `REJECT [DOCB012]`; DIDA exige retiro/tombstone.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| inserción/canonicalización | 001–010, 024–027 |
| remoción/round-trip | 011–014, 033–034 |
| encoding/newlines/front matter | 017–023 |
| hashes/body/diff | 028–037 |
| staleness/determinismo | 038–042 |
| seguridad/lifecycle | 043–048 |

Todos los códigos `DOCB001`–`DOCB012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Inserción, extracción, remoción y round-trip cubiertos.
- [x] BOM, CRLF, foreign front matter y delimitadores cubiertos.
- [x] Byte drift, staleness, seguridad y registry lifecycle cubiertos.
- [x] Doce códigos cubiertos.
- [ ] Materializar byte fixtures y expected hashes.
- [ ] Aprobar mode/schema/catalog mediante DOC-REV.
- [ ] Implementar transformer sólo después de aprobación.

Los últimos tres checks permanecen abiertos.
