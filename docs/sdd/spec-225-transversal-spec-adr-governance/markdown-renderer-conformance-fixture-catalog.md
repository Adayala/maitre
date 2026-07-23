# Catálogo de conformidad del renderer Markdown — SPEC-225

## Propósito

Definir el conjunto mínimo de inputs que todo candidato a `rendererProfile` debe evaluar antes de
ser seleccionado. El catálogo detecta diferencias; no declara ganador ni inventa outputs sin
evidencia del renderer.

## Dos etapas

Cada caso atraviesa:

1. `CANDIDATE_OBSERVATION`: se ejecuta el renderer candidato, se registra output y provenance;
2. `NORMATIVE_FIXTURE`: tras aprobación, ese output revisado queda fijado al profile/revisión.

Un resultado observado no es normativo hasta tener DOC-REV. Los campos `expectedGeneratedIds`
permanecen `UNRESOLVED` en este catálogo porque `selectedProfile` es `NOT_CONFIGURED`.

## Schema

```yaml
id: RENDER-FIX-NNN
sourceMarkdown: <bytes exactos o fixtureRef + sha256>
candidate:
  profile: <profileId@revision>
  rendererVersion: <exacta>
  sluggerVersion: <exacta>
expected:
  status: UNRESOLVED | APPROVED
  headingCount: <entero o UNRESOLVED>
  generatedIds: [<strings>] | UNRESOLVED
  excludedHeadings: [<ubicaciones>] | UNRESOLVED
observation:
  outputHash: <sha256 o null>
  environmentRef: <lockfile/container ref o null>
  evidenceRef: <ref o null>
approval:
  reviewRef: <DOC-REV o null>
```

Los bytes del input, no una representación reserializada, forman parte de la fixture.

## Casos base de headings

### RENDER-FIX-001 — ATX nivel 1

Input: `# Heading`.

Debe producir exactamente un heading direccionable o declarar que ATX no es soportado. Un profile
para Maitre no puede activarse si no lo soporta.

### RENDER-FIX-002 — ATX niveles 2–6

Un heading por nivel. Registra si el nivel participa en el ID; divergencias deben ser explícitas.

### RENDER-FIX-003 — Setext

Input con variantes `=` y `-`. Registra ambos IDs y evita confundir separador temático con heading.

### RENDER-FIX-004 — Closing hashes

Compara `## Heading ##` con `## Heading`.

### RENDER-FIX-005 — Espacio requerido

Compara `#Heading` con `# Heading`; fija qué sintaxis crea heading.

## Case y whitespace

### RENDER-FIX-006 — Mayúsculas y minúsculas

Inputs `Hello World`, `HELLO WORLD` y `hello world`.

### RENDER-FIX-007 — Espacios consecutivos

Compara uno, dos y cuatro espacios internos.

### RENDER-FIX-008 — Tabs

Tabs iniciales e internos; registra parseo y normalización.

### RENDER-FIX-009 — Whitespace periférico

Espacios antes/después del texto y antes de closing hashes.

### RENDER-FIX-010 — Guiones existentes

Compara `hello world`, `hello-world` y `hello--world`.

## Puntuación y escapes

### RENDER-FIX-011 — Puntuación ASCII

Una matriz versionada incluye `. , : ; ! ? ( ) [ ] { } / \ | @ # $ % ^ & * + = ~`.

### RENDER-FIX-012 — Comillas y apóstrofes

Compara comillas simples, dobles, tipográficas y contracciones.

### RENDER-FIX-013 — Escapes Markdown

Compara puntuación literal y escapada.

### RENDER-FIX-014 — Entidades

Compara `&amp;`, `&lt;`, entidad numérica y el carácter decodificado equivalente.

### RENDER-FIX-015 — Sólo símbolos

Headings compuestos sólo por puntuación/emoji; registra ID vacío, ausencia o valor generado.

## Unicode

### RENDER-FIX-016 — Diacríticos

Inputs españoles: `Especificación`, `Organización` y `Revisión`.

### RENDER-FIX-017 — Equivalencia Unicode

El mismo carácter en NFC y NFD. El reporte debe preservar bytes y declarar si los IDs coinciden.

### RENDER-FIX-018 — Scripts no latinos

Casos mínimos en alfabetos no latinos, preservados como fixtures de bytes.

### RENDER-FIX-019 — Emoji

Emoji simple, con variation selector y secuencia ZWJ.

### RENDER-FIX-020 — Caracteres invisibles

Non-breaking space, zero-width joiner/non-joiner y directional marks. El reporte no puede
ocultarlos; usa representación escapada adicional.

## Contenido inline

### RENDER-FIX-021 — Énfasis

Compara texto plano, emphasis y strong con el mismo contenido visible.

### RENDER-FIX-022 — Inline code

Heading que incluye code span y backticks escapados.

### RENDER-FIX-023 — Link dentro de heading

Registra si el ID usa label, destino o ambos. Un destino URL no debe generar acceso de red.

### RENDER-FIX-024 — Imagen dentro de heading

Registra tratamiento de alt text y destino.

### RENDER-FIX-025 — HTML inline

Compara tags de presentación, comment y elemento con atributo `id`.

## Duplicados y orden

### RENDER-FIX-026 — Duplicado simple

Tres headings idénticos consecutivos; fija el ID de cada ocurrencia.

### RENDER-FIX-027 — Colisión natural con sufijo

Combina headings cuyo texto ya termina con el sufijo que el candidato usa para duplicados.

### RENDER-FIX-028 — Duplicados no consecutivos

El mismo heading aparece antes y después de otros; el contador debe seguir la semántica aprobada.

### RENDER-FIX-029 — Colisión después de normalizar

Textos distintos que producen el mismo slug base por case, espacios o puntuación.

### RENDER-FIX-030 — Orden alterado

Mismos headings en orden diferente. Explicita cuáles IDs cambian y prueba que el orden documental,
no el filesystem, gobierna duplicados.

## Contextos excluidos o especiales

### RENDER-FIX-031 — Fenced e indented code

Texto con apariencia de heading dentro de ambos tipos de code block no debe producir anchor si el
parser lo clasifica como código.

### RENDER-FIX-032 — Blockquote

Heading dentro de blockquote; output queda fijado por el profile.

### RENDER-FIX-033 — Lista

Heading anidado bajo list item y texto que sólo se parece a un heading.

### RENDER-FIX-034 — Raw HTML block

Heading Markdown dentro y alrededor de raw HTML; registra límites del parser.

### RENDER-FIX-035 — Heading vacío

ATX sin contenido visible y variantes con sólo formatting.

### RENDER-FIX-036 — Front matter

Marcadores YAML al inicio y headings posteriores; evita interpretar campos como Setext.

## IDs explícitos y fragments

### RENDER-FIX-037 — Atributo explícito único

Input con sintaxis de ID explícito candidata. Registra `SUPPORTED` o `UNSUPPORTED`; no presupone
extensiones no estándar.

### RENDER-FIX-038 — Atributo explícito duplicado

Si se soporta, dos headings solicitan el mismo ID. Debe resultar inequívoco o el profile no puede
usarse con `EXPLICIT_ANCHORS_REQUIRED`.

### RENDER-FIX-039 — Percent-decoding

Compara fragment literal, UTF-8 percent-encoded y encoding inválido. El slugger recibe el heading;
el resolver decodifica el fragment exactamente una vez.

### RENDER-FIX-040 — Case del fragment

Compara ID generado con fragments en distintos case y fija sensibilidad.

## Conformidad, upgrades y determinismo

### RENDER-FIX-041 — Ejecución repetida

Mismo input/profile ejecutado dos veces.

Expected invariant: outputs y reporte comparables byte-idénticos.

### RENDER-FIX-042 — Orden de archivos

Fixtures enumeradas en distinto orden.

Expected invariant: cada resultado conserva identidad y el reporte se ordena por fixture ID.

### RENDER-FIX-043 — Versión no exacta

Profile usa range, tag mutable o versión ausente.

Expected: profile no elegible; ningún output se promueve a normativo.

### RENDER-FIX-044 — Output sin provenance

Falta versión, lockfile/container ref, input hash o output hash.

Expected: observación `INCOMPLETE`; no aprobable.

### RENDER-FIX-045 — Upgrade sin cambio

Nueva versión produce outputs idénticos para catálogo y documentos reales.

Expected: manifest `UNCHANGED`; todavía requiere DOC-REV.

### RENDER-FIX-046 — Upgrade compatible con nuevos casos

Outputs previos idénticos y nuevas fixtures agregadas con evidencia.

Expected: cambio compatible de profile revision, sujeto a review.

### RENDER-FIX-047 — Upgrade rompe fragment

Al menos un ID normativo cambia o deja de existir.

Expected: manifest `CHANGED` o `BROKEN`; activación bloqueada hasta remediación explícita.

### RENDER-FIX-048 — Dos renderers divergen

Mismo heading produce IDs diferentes bajo profiles candidatos.

Expected: la estrategia multi-renderer decide warning, fail o exigencia de ID explícito; nunca se
elige silenciosamente el resultado del primero.

## Evaluación de candidatos

Cada candidato produce una matriz:

```yaml
candidateId: <ID>
profileRef: <profileId@revision>
fixturesTotal: 48
observed: 0
unresolved: 48
divergencesAgainstOthers: 0
activationBlockers: [<refs>]
```

La comparación no puntúa “mejor” automáticamente. Owner/reviewers evalúan fidelidad al consumidor
autoritativo, reproducibilidad offline, seguridad y costo de compatibilidad.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| heading syntax | 001–005 |
| case/whitespace | 006–010 |
| punctuation/escapes | 011–015 |
| Unicode | 016–020 |
| inline content | 021–025 |
| duplicates/order | 026–030 |
| contexts | 031–036 |
| explicit IDs/fragments | 037–040 |
| determinism/upgrades | 041–048 |

## Criterios de salida

- [x] Inputs mínimos y expectativas relacionales especificados.
- [x] Unicode, punctuation, inline content y duplicados cubiertos.
- [x] Provenance, determinismo, divergencia y upgrades cubiertos.
- [ ] Materializar los 48 inputs con bytes/hashes.
- [ ] Ejecutar candidatos y completar outputs observados.
- [ ] Seleccionar candidato con owner/reviewers.
- [ ] Aprobar outputs como fixtures normativas mediante DOC-REV.
- [ ] Fijar fixture set hash en el profile.

Los outputs continúan `UNRESOLVED`; el catálogo no selecciona ni implementa renderer.
