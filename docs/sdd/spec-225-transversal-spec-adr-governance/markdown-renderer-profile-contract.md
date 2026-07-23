# Contrato de renderer profile Markdown — SPEC-225

## Propósito

Definir cómo se identifica, aprueba, versiona y cambia la semántica usada para resolver headings y
fragments Markdown. Este contrato no selecciona por sí mismo un renderer productivo ni implementa
un slugger.

Sin un profile aprobado, validar que el archivo de un link existe es posible; afirmar que
`archivo.md#fragment` resuelve correctamente no lo es.

## Estado de decisión

```yaml
decision:
  status: PROPOSED
  selectedProfile: NOT_CONFIGURED
  owner: UNASSIGNED
  reviewers: [UNASSIGNED]
  effectiveFrom: null
  reviewRef: null
```

La ausencia es un blocker explícito del fragment gate. No se reemplaza con detección automática del
entorno de CI ni con el comportamiento incidental de una librería instalada.

## Identidad del profile

```yaml
rendererProfile:
  profileId: <RENDERER-NNN>
  name: <identidad estable>
  profileRevision: <entero positivo>
  rendererFamily: <familia>
  rendererVersion: <versión exacta>
  sluggerImplementation: <paquete/componente>
  sluggerVersion: <versión exacta>
  normalization:
    unicode: <política>
    case: <política>
    punctuation: <política>
    whitespace: <política>
    duplicateHeadings: <política>
    explicitHeadingIds: <SUPPORTED | UNSUPPORTED>
  sourceSyntax:
    headingStyles: [ATX, SETEXT]
    rawHtml: <política>
  conformanceFixtureSet: <ref + hash>
  status: PROPOSED | ACTIVE | DEPRECATED | SUPERSEDED | RETIRED
  supersedes: <profileId@revision o null>
  approvedBy: [<DOC-REV refs>]
  effectiveFrom: <commit completo o null>
```

`rendererVersion` y `sluggerVersion` no admiten ranges. `name` no es suficiente para reproducir
comportamiento.

## Fuente de autoridad

El profile reproduce el renderer elegido por el repositorio; no inventa una semántica paralela para
el validator. La selección debe justificar:

1. dónde consumen Markdown los revisores;
2. qué renderer constituye la experiencia canónica;
3. si existe más de un renderer material;
4. cómo se resuelven divergencias entre ellos;
5. qué versión exacta queda fijada para CI.

La precedencia es:

1. profile `ACTIVE` y su fixture set aprobado;
2. documentación oficial/versionada del renderer elegido;
3. comportamiento observado reproducible;
4. nunca la intuición del implementador.

Una observación que contradice fixtures abre finding y bloquea upgrade; no muta el profile vigente.

## Candidatos

| Candidato | Uso esperado | Ventaja | Riesgo | Estado |
| --- | --- | --- | --- | --- |
| `GITHUB_REPOSITORY_MARKDOWN` | navegación primaria dentro del repositorio | alinea links con la UI habitual del código | requiere fijar versión/semántica reproducible | `PROPOSED` |
| `COMMONMARK_BASE` | portabilidad mínima | estándar acotado | no define por sí solo slugs de headings | `INCOMPLETE` |
| `CUSTOM_MAITRE` | reglas propias | control total | crea divergencia y mantenimiento permanente | `NOT_RECOMMENDED` |
| `MULTI_RENDERER_INTERSECTION` | varios consumidores igualmente autoritativos | evita fragments válidos sólo en una UI | puede rechazar headings legítimos y ampliar fixtures | `CONDITIONAL` |

`GITHUB_REPOSITORY_MARKDOWN` es candidato preferido para evaluación, no selección aprobada. Debe
demostrar reproducibilidad offline antes de pasar a `ACTIVE`.

## Semántica que debe fijarse

El fixture set del profile define, como mínimo:

- ATX y Setext headings;
- mayúsculas/minúsculas;
- espacios consecutivos, tabs y guiones;
- puntuación ASCII;
- caracteres Unicode, diacríticos y emoji;
- inline emphasis, links e inline code dentro de headings;
- entidades y escapes;
- headings duplicados y sufijos;
- atributos/IDs explícitos si el renderer los soporta;
- fragment percent-decoding;
- headings dentro de blockquotes, listas, HTML y fenced code;
- headings vacíos o compuestos sólo por símbolos.

No se normaliza Unicode, translitera, elimina puntuación ni numera duplicados salvo que el profile
lo ordene y una fixture lo demuestre.

## Resolución

```text
source fragment
  → percent-decode exactamente una vez
  → parsear destino Markdown con la sintaxis del profile
  → generar IDs en orden documental usando el slugger fijado
  → comparar según la política exacta del renderer
  → RESOLVED | NOT_FOUND | AMBIGUOUS | NOT_CONFIGURED
```

- `NOT_FOUND`, `AMBIGUOUS` y `NOT_CONFIGURED` se reportan como `NAVL006`.
- El ID visible generado es parte del evidence output.
- Headings dentro de ejemplos/código no generan anchors.
- Duplicados nunca se resuelven buscando sólo por texto; se usa el ID final generado.
- Un link no se reescribe automáticamente para hacerlo coincidir.

## Múltiples renderers

Si el repositorio declara más de un consumidor autoritativo, la decisión selecciona una estrategia:

```text
PRIMARY_WITH_WARNINGS | INTERSECTION_REQUIRED | EXPLICIT_ANCHORS_REQUIRED
```

- `PRIMARY_WITH_WARNINGS`: el primario gobierna; incompatibilidades secundarias son findings
  visibles no bloqueantes con owner.
- `INTERSECTION_REQUIRED`: cada fragment debe resolver igual en todos los profiles aprobados.
- `EXPLICIT_ANCHORS_REQUIRED`: sólo se admiten IDs explícitos soportados de forma equivalente.

No se elige estrategia hasta inventariar consumidores reales.

Los criterios de materialidad, autoridad y la línea base de consumidores están definidos en
`markdown-consumer-authority-contract.md`.

## Línea base actual

El relevamiento sintáctico inicial detectó:

- 10 links Markdown inline con fragment;
- distribuidos en 10 archivos;
- todos apuntan al diccionario físico de SPEC-210;
- cero symlinks bajo `docs/`.

Este conteo no valida los fragments: el audit histórico los excluyó y `selectedProfile` continúa
`NOT_CONFIGURED`. Antes de activar el gate deben parsearse los headings destino con el candidato
evaluado y registrar outcome individual.

El inventario por source/target, estados y evidence schema está en
`markdown-fragment-validation-register.md`.

## Compatibilidad y upgrades

Un cambio de `rendererFamily`, renderer, slugger o cualquier regla de normalización crea una nueva
`profileRevision`. El upgrade requiere:

1. ejecutar fixtures anteriores y nuevas;
2. comparar todos los fragments versionados;
3. producir manifest `UNCHANGED | CHANGED | BROKEN | AMBIGUOUS`;
4. revisar links afectados y consumidores;
5. aprobar DOC-REV sobre commit/profile exactos;
6. fijar `effectiveFrom`;
7. conservar el profile previo como `SUPERSEDED`.

Un cambio que rompe al menos un fragment es incompatible y no puede activarse junto con una
excepción baseline creada automáticamente.

## Conformance report

```yaml
schemaVersion: 1
profile: <profileId@revision>
subjectCommit: <sha completo>
fixtureSetHash: sha256:<hex>
documentsHash: sha256:<hex>
summary:
  fragments: 0
  resolved: 0
  notFound: 0
  ambiguous: 0
results:
  - source: <path>
    line: 0
    rawFragment: <valor>
    target: <path>
    generatedHeadingId: <valor o null>
    outcome: RESOLVED | NOT_FOUND | AMBIGUOUS
```

El reporte es determinista, ordenado por source/línea/fragment y no contiene timestamps ni rutas
absolutas.

## Activación

Un profile pasa a `ACTIVE` sólo si:

- owner y reviewers están asignados y aceptaron;
- versiones exactas y hashes están fijados;
- fixture set ejecutable pasa;
- los 10 fragments actuales fueron evaluados;
- no existen outcomes `NOT_FOUND`/`AMBIGUOUS` sin resolución;
- existe DOC-REV aprobatorio;
- CI puede reproducirlo offline desde lockfile;
- el contrato NAVL referencia la revisión activa.

La aprobación del profile habilita validar fragments; no aprueba el contenido de los documentos.

## Criterios de salida

- [x] Schema, candidatos, lifecycle y estrategia de upgrade especificados.
- [x] Baseline sintáctico inicial relevado.
- [x] Inventariar consumidores Markdown configurados/observables.
- [ ] Aprobar consumidores Markdown autoritativos.
- [ ] Seleccionar renderer y slugger exactos.
- [x] Especificar catálogo de conformance fixtures del profile.
- [ ] Materializar y ejecutar fixtures.
- [ ] Evaluar los 10 fragments actuales.
- [ ] Registrar DOC-REV y activar profile.

Los últimos cinco checks permanecen abiertos; no existe todavía renderer profile productivo. Los
inputs y expectativas relacionales están en
`markdown-renderer-conformance-fixture-catalog.md`; sus outputs siguen `UNRESOLVED`.

La evaluación y selección futura debe ejecutarse bajo
`markdown-renderer-selection-manifest.md`; su estado inicial es `PLANNED`.
