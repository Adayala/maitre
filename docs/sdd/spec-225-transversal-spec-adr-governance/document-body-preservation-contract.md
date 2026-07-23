# Contrato de preservación del body Markdown — SPEC-225

## Propósito

Definir una transformación reversible para agregar o retirar el envelope `sddDocument` sin alterar
un solo byte del body Markdown. Este contrato no implementa parser ni modifica documentos.

## Invariante central

Para una inserción:

```text
targetBytes = canonicalEnvelopeBytes + sourceBodyBytes
extractBody(targetBytes) == sourceBodyBytes
sha256(extractBody(targetBytes)) == sha256(sourceBodyBytes)
```

Para una remoción:

```text
removeEnvelope(targetBytes) == sourceBodyBytes
```

La igualdad es byte a byte, no equivalencia visual ni AST equivalente.

## Terminología

- `sourceBodyBytes`: archivo legacy completo antes de agregar envelope.
- `canonicalEnvelopeBytes`: front matter aprobado, incluido delimitador final/newline.
- `targetBytes`: archivo con envelope seguido inmediatamente por body.
- `extractedBodyBytes`: bytes posteriores al cierre canónico del envelope.
- `bodyHash`: SHA-256 de bytes exactos, no texto normalizado.

## Precondiciones de formato

El modo inicial `BYTE_PRESERVE_V1` admite:

```yaml
encoding: UTF-8
bom: ABSENT
newlines: LF_ONLY
existingFrontMatter: ABSENT
yamlDelimiter: "---"
```

Un source con BOM, CRLF/mixed newline, encoding inválido o front matter preexistente se clasifica
`UNSUPPORTED_REQUIRES_MAPPING`; no se normaliza silenciosamente. Una revisión futura puede
especificar otra estrategia/version.

Esta restricción concilia:

- envelope canónico UTF-8/LF;
- preservación byte-exacta del body;
- archivo target sin mezcla accidental de políticas.

## Serialización del envelope

```text
byte 0: "---\n"
contenido YAML canónico
cierre: "---\n"
byte siguiente: primer byte exacto del source body
```

- No se inserta blank line adicional.
- Si el body comenzaba con blank line, se conserva.
- Si terminaba sin newline, continúa sin newline.
- Claves/arrays siguen orden canónico DOCM.
- Strings se escapan de forma determinista.
- No se admiten anchors, aliases, tags ni múltiples documentos YAML.
- El contenido `---` dentro del body no afecta extracción.

## Detección de envelope

Un envelope existe sólo si:

1. comienza en byte 0 con `---\n`;
2. el cierre `---\n` aparece como línea completa;
3. el YAML entre delimitadores parsea de forma segura;
4. contiene exactamente una clave raíz `sddDocument`;
5. schemaVersion es soportada.

Un ejemplo fenced, una regla horizontal posterior o un bloque `---` sin `sddDocument` no cuenta.

## Source con front matter preexistente

No se fusionan mapas YAML automáticamente.

```text
NO_FRONT_MATTER → puede insertar
SDD_FRONT_MATTER → validar/update mediante contrato de revisión
FOREIGN_FRONT_MATTER → BLOCKED_FOR_RECONCILIATION
MALFORMED_FRONT_MATTER → REJECT
```

La reconciliación futura debe decidir namespace, consumidores y preservación; no anida un segundo
front matter.

## Schema de propuesta

```yaml
bodyPreservation:
  schemaVersion: 1
  mode: BYTE_PRESERVE_V1
  subjectCommit: <sha completo>
  source:
    path: <path relativo>
    fullSha256: <hex>
    byteLength: <entero>
    encoding: UTF-8
    bom: ABSENT
    newlineMode: LF_ONLY
    existingFrontMatter: ABSENT
  envelope:
    metadataRef: <mapping>
    canonicalSha256: <hex>
    byteLength: <entero>
  target:
    fullSha256: <hex>
    byteLength: <entero>
    extractedBodySha256: <hex>
    extractedBodyLength: <entero>
  assertions:
    bodyHashEqual: true
    bodyLengthEqual: true
    roundTripEqual: true
    nonEnvelopeDiffs: 0
```

Los hashes se calculan sobre bytes del subject commit/snapshot, no sobre una copia reserializada.

## Diff permitido

El diff semántico del piloto debe ser:

```text
INSERT canonicalEnvelopeBytes at byte 0
PRESERVE sourceBodyBytes exactly
```

Está prohibido en el mismo paso:

- reflow de párrafos;
- conversión CRLF/LF;
- agregar/quitar trailing newline;
- cambiar BOM/encoding;
- ordenar tablas/listas;
- normalizar espacios;
- corregir typos;
- cambiar links/headings;
- agregar backlink;
- actualizar outcomes.

Una corrección deseada se mueve a otro mapping/batch.

## Round-trip

La verificación mínima:

1. leer source bytes;
2. producir envelope canónico desde mapping congelado;
3. concatenar sin tocar source;
4. parsear target;
5. extraer body;
6. comparar length/hash/bytes;
7. retirar envelope;
8. comparar resultado con source;
9. repetir operación para verificar determinismo.

Pasar round-trip no aprueba metadata; sólo prueba preservación.

## Staleness y concurrencia

La propuesta pasa a `STALE` si cambia:

- source full/body hash;
- mapping/envelope hash;
- subject commit/snapshot;
- schema/mode/parser version;
- path/disposición;
- newline/encoding/front-matter classification.

Un source tracked-modified requiere snapshot de worktree; usar el blob de HEAD en su lugar sería
evaluar otros bytes.

## Línea base del piloto

Observación previa al freeze:

| Mapping | Path | Bytes | Líneas LF | CR bytes | BOM | Primeros bytes | Resultado |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| `DOCM-MAP-001` | `reviews/README.md` | 4.115 | 64 | 0 | ausente | `# R` (`23 20 52`) | `FORMAT_ELIGIBLE_OBSERVED` |
| `DOCM-MAP-002` | `evidence/README.md` | 918 | 20 | 0 | ausente | `# R` (`23 20 52`) | `FORMAT_ELIGIBLE_OBSERVED` |

```yaml
baselineId: DOCB-BASE-001
status: OBSERVED_NOT_FROZEN
eligibleObserved: 2
hashesFrozen: 0
roundTripsExecuted: 0
```

Los conteos pueden quedar stale antes del snapshot. `FORMAT_ELIGIBLE_OBSERVED` no significa que el
body esté aprobado ni que la transformación haya sido ejecutada.

## Rollback

- Antes de publicación: descartar propuesta en memoria/artifact.
- Después de commit no aceptado: cambio reversivo revisado que retira envelope y demuestra body
  hash igual.
- Después de ID publicado: retirar envelope no libera ID; registry/tombstone sigue DIDA.
- Nunca usar checkout/reset destructivo sobre source concurrentemente modificado.

## Reporte determinista

```yaml
schemaVersion: 1
subjectCommit: <sha>
mode: BYTE_PRESERVE_V1
results:
  - path: <path>
    sourceBodySha256: <hex>
    envelopeSha256: <hex>
    targetSha256: <hex>
    extractedBodySha256: <hex>
    roundTrip: PASS | FAIL
    findingCodes: [<DOCBxxx>]
```

Orden por path, sin timestamps, rutas absolutas, contenido completo ni performance timings.

## Códigos

| Código | Condición |
| --- | --- |
| `DOCB001` | schema/mode/path/input inválido |
| `DOCB002` | encoding inválido, BOM o newline mode no soportado |
| `DOCB003` | front matter extranjero/malformado/duplicado |
| `DOCB004` | envelope no canónico o YAML inseguro |
| `DOCB005` | source/body hash o length inconsistente |
| `DOCB006` | extracted body difiere del source |
| `DOCB007` | round-trip no recupera source exacto |
| `DOCB008` | diff contiene cambios fuera del envelope |
| `DOCB009` | mapping/envelope/source/snapshot stale |
| `DOCB010` | operación no determinista |
| `DOCB011` | contenido sensible expuesto en reporte/log |
| `DOCB012` | review/registry/ID lifecycle incompatible |

## Relación con otros contratos

- DOCM define metadata y serialización lógica.
- DIDA asigna identidad y registry entry.
- SNAP congela bytes/provenance.
- DOC-REV aprueba mapping/diff.
- NAVD/NAVL comprueban que navegación no se degrade.

Preservar body no cierra ninguno de esos gates.

## Criterios de salida

- [x] Invariante byte-exacta y formato inicial especificados.
- [x] Extracción, round-trip, diff, staleness y rollback especificados.
- [x] Línea base de formato de los dos índices relevada.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `DOCB`.
- [ ] Aprobar mode/schema.
- [ ] Congelar hashes del piloto.
- [ ] Implementar transformación sólo después de aprobación.

Los últimos tres checks permanecen abiertos. Los casos normativos están definidos en
`document-body-preservation-fixture-catalog.md`; `roundTripsExecuted=0`.
