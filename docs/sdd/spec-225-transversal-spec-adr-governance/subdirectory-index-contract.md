# Contrato de índices de subdirectorios documentales — SPEC-225

## Propósito

Garantizar que colecciones Markdown anidadas sean descubribles, tengan alcance explícito y no
dependan de navegar el filesystem. Este contrato no crea índices ni cambia autoridad de artifacts.

## Unidad y umbral

Para cada directorio bajo `docs/sdd/`:

- `0` Markdown directos: no requiere índice documental;
- `1` Markdown directo: índice opcional si no posee lifecycle/colección propia;
- `2+` Markdown directos: requiere `README.md` en ese directorio;
- cualquier número con lifecycle, registro o secuencia propia: requiere `README.md`.

El conteo es por hijos directos. Cada nivel se evalúa independientemente; un README ancestral no
reemplaza el índice de una colección anidada.

Assets no Markdown no activan el umbral por sí solos, pero una colección de evidencia/assets con
lifecycle propio sí lo hace.

## Alcance del índice

Todo índice requerido declara:

```yaml
directoryIndex:
  directory: <path relativo>
  indexRole: GUIDE | EVIDENCE | AUDIT | MIGRATION | HISTORICAL
  collectionRoles:
    - AUTHORITATIVE | DERIVED | EVIDENCE | AUDIT | MIGRATION | GUIDE | HISTORICAL
  owner: <assignment o UNASSIGNED>
  status: DRAFT | ACTIVE | DEPRECATED | SUPERSEDED | RETIRED
  parentEntrypoint: <README/índice alcanzable>
  coverageMode: DIRECT_CHILDREN
  exclusions: [<path + razón + owner + retiro>]
```

El metadata puede permanecer lógico durante migración, pero ausencia de owner no permite ocultar
artifacts.

`indexRole` describe al README como navegador/registro. `collectionRoles` describe los artifacts
que organiza; no se exige que sean homogéneos. Un índice `GUIDE` no degrada la autoridad de un hijo
`AUTHORITATIVE` ni transforma un template en evidence.

## Cobertura

El `README.md` enlaza cada Markdown hijo directo, salvo exclusión versionada y vigente.

- El mismo archivo puede aparecer en tabla temática y sección histórica; cuenta una vez.
- Links indirectos hacia un hijo no satisfacen `DIRECT_CHILDREN`.
- Un subdirectorio hijo se enlaza mediante su `README.md`, no listando todos sus descendientes.
- El propio README no se cuenta como artifact que deba autoenlazarse.
- Artifacts generados/efímeros requieren clasificación; no se excluyen por naming convention.
- Un link roto no aporta cobertura.

## Contenido mínimo

Un índice requerido explica:

1. propósito/alcance de la colección;
2. rol y autoridad de los artifacts;
3. tabla/lista completa de hijos directos;
4. lifecycle/outcome cuando aplica;
5. reglas de alta, retiro o supersession;
6. link al parent entrypoint;
7. exclusions vigentes.

El índice no duplica contenido normativo ni promueve outcomes.

## Navegación bidireccional

- El parent README/índice enlaza el subdirectorio requerido.
- El subdirectorio identifica su parent entrypoint.
- La ausencia de link de retorno no vuelve huérfanos a los hijos si son alcanzables, pero genera
  finding de navegación/ownership.
- Mover la colección actualiza parent, índice y consumers en el mismo cambio.

No se exige insertar links automáticos en cada artifact hacia el índice.

## Línea base actual

El relevamiento de directorios bajo `docs/sdd/` encontró:

```yaml
directoriesBelowSpecRoot: 3
directoriesWithTwoOrMoreMarkdown: 2
requiredIndexesPresent: 2
requiredIndexesMissing: 0
directChildrenRequired: 31
directChildrenLinked: 31
requiredParentLinks: 2
requiredParentLinksPresent: 2
singleArtifactDirectories: 1
```

Detalle:

| Directorio | Markdown directos | README | Hijos cubiertos | Resultado |
| --- | ---: | --- | ---: | --- |
| `spec-225-.../reviews/` | 26 incluyendo README | presente | 25/25 | `COMPLIANT_BASELINE` |
| `spec-226-.../evidence/` | 7 incluyendo README | presente | 6/6 | `COMPLIANT_BASELINE` |
| `spec-225-.../migrations/` | 1 | ausente/opcional | 1 enlazado directamente por parent | `BELOW_THRESHOLD` |

`COMPLIANT_BASELINE` describe presencia/cobertura, no aprueba outcomes ni metadata lógica del
índice. El directorio `migrations/` deberá crear README antes o en el mismo cambio que agregue un
segundo artifact o declare lifecycle de colección propio.

## Códigos

| Código | Condición |
| --- | --- |
| `NAVD001` | índice requerido ausente |
| `NAVD002` | hijo Markdown directo no enlazado |
| `NAVD003` | link a hijo roto, fuera de scope o casing incorrecto |
| `NAVD004` | parent no enlaza colección requerida |
| `NAVD005` | exclusión ausente, inválida o vencida |
| `NAVD006` | scope/rol/lifecycle del índice ausente o inconsistente |
| `NAVD007` | artifact retirado/superseded sin successor/historia |
| `NAVD008` | baseline crece, cambia scope o serialización no determinista |

Los errores de path se detallan además con subcódigos `NAVL`; `NAVD` expresa el efecto sobre la
colección.

## Transiciones

### Primer → segundo artifact

El mismo commit debe:

- crear `README.md`;
- enlazar ambos hijos;
- enlazar el índice desde parent;
- declarar scope/rol;
- validar cero links rotos.

No existe ventana permitida de “agregar ahora, indexar después”.

### Retiro hasta un artifact

El README no se elimina automáticamente. Primero se revisa si:

- conserva historia/successors;
- el directorio mantiene lifecycle propio;
- existen links externos/internos hacia el índice;
- el artifact restante necesita contexto.

Retirar el índice requiere manifest/review; bajar del umbral no prueba que sea seguro borrarlo.

## Reporte

```yaml
schemaVersion: 1
subjectCommit: <sha completo>
scopeHash: sha256:<hex>
directories:
  - path: <directorio>
    markdownChildren: 0
    indexRequired: true | false
    indexPresent: true | false
    linkedChildren: 0
    excludedChildren: 0
    parentLinked: true | false
    classification: COMPLIANT | BELOW_THRESHOLD | FINDING
findings: [<NAVD records>]
```

Orden lexicográfico por path; sin timestamps, paths absolutos ni orden del filesystem.

## Ratchet

- cero nuevos índices requeridos ausentes;
- cero hijos directos nuevos sin link;
- cero parent links removidos sin successor;
- exclusions sólo decrecen o se renuevan mediante review;
- cambiar umbral/scope requiere nueva revisión de contrato y baseline.

La línea base actual de `NAVD001/002` es cero; no admite incorporar deuda nueva.

## Relación con otros contratos

- `document-role-navigation-contract.md` define rol/autoridad general.
- `markdown-link-reachability-contract.md` resuelve links y grafo.
- `global-navigation-baseline.md` cubre entrypoints/root artifacts de specs.
- `document-review-evidence-contract.md` registra review de creación/retiro.

Cumplir este contrato no resuelve los 289 orphans raíz ni la reachability global 0/226.

## Criterios de salida

- [x] Umbral, cobertura, parent link y lifecycle especificados.
- [x] Tres subdirectorios relevados.
- [x] Dos índices requeridos presentes y 31/31 hijos cubiertos.
- [x] Ambos índices requeridos enlazados desde su parent.
- [x] Baseline `NAVD001/002 = 0`.
- [x] Especificar fixtures `NAVD`.
- [ ] Implementar gate sólo después de aprobación.
- [ ] Completar metadata lógica/ownership de índices existentes.

Los últimos dos checks permanecen abiertos. Los casos normativos están definidos en
`subdirectory-index-fixture-catalog.md`.
