# Contrato e inventario de consumidores Markdown — SPEC-225

## Propósito

Definir qué convierte a un consumidor de Markdown en autoritativo y registrar la línea base actual.
Un consumidor es cualquier UI, generador, parser o validador que interprete documentos; almacenar
bytes en Git no basta.

Este contrato no elige renderer ni instala tooling.

## Dimensiones

La existencia y la autoridad son dimensiones separadas:

```text
Evidence status:
  CONFIRMED_CONFIGURED | OBSERVED | CLAIMED | ABSENT | UNKNOWN

Authority status:
  PRIMARY_CANDIDATE | SECONDARY_CANDIDATE | ACTIVE_PRIMARY |
  ACTIVE_SECONDARY | NON_AUTHORITATIVE | EXCLUDED | UNASSESSED
```

- `CONFIRMED_CONFIGURED`: existe configuración versionada y reproducible.
- `OBSERVED`: hay evidencia directa de uso/integración, pero falta configuración suficiente.
- `CLAIMED`: documentación/persona lo menciona sin evidencia versionada.
- `ABSENT`: búsqueda acotada confirma que el mecanismo no está configurado.
- `UNKNOWN`: no fue posible evaluarlo.

`PRIMARY_CANDIDATE` no otorga autoridad. `ACTIVE_*` requiere asignación, review y fecha efectiva.

## Registro

```yaml
consumer:
  consumerId: <MD-CONS-NNN>
  name: <identidad>
  category: REPOSITORY_UI | DOCS_SITE | IDE_PREVIEW | CI_PARSER | EXPORTER | API
  evidenceStatus: <enum>
  evidenceRefs: [<config/path/remote/ref>]
  audience: [AUTHOR | REVIEWER | OPERATOR | EXTERNAL]
  materiality: REQUIRED | COMMON | OPTIONAL | UNKNOWN
  rendererFamily: <valor o UNKNOWN>
  rendererVersion: <exacta o UNKNOWN>
  anchorSemantics: <profile ref o UNKNOWN>
  offlineReproducible: true | false | UNKNOWN
  authorityStatus: <enum>
  owner: <assignment o UNASSIGNED>
  reviewers: [<assignments>]
  effectiveFrom: <commit o null>
  reviewRef: <DOC-REV o null>
```

Cada consumer ID es estable. Cambiar producto o familia semántica crea nuevo consumer; una upgrade
compatible actualiza revisión/evidence.

## Criterios de materialidad

Un consumidor es material si al menos una condición tiene evidencia:

- es la superficie habitual de revisión/approval;
- publica documentación a usuarios u operadores;
- su interpretación bloquea CI;
- sus anchors se distribuyen como enlaces persistentes;
- transforma Markdown a otro formato contractual.

Uso ocasional en un editor personal no lo hace material. Tampoco se declara `EXCLUDED` sin
evidencia de que sus divergencias son aceptables.

## Selección de autoridad

Para `ACTIVE_PRIMARY` se requiere:

1. audiencia y flujo de uso confirmados;
2. owner y reviewers con assignment aceptado;
3. renderer/slugger exactos o mecanismo estable para capturar su semántica;
4. reproducción offline apta para CI;
5. ejecución del catálogo `RENDER-FIX-001`–`048`;
6. evaluación de los fragments reales;
7. estrategia para consumidores secundarios;
8. DOC-REV aprobatorio y `effectiveFrom`.

Si ningún consumidor satisface reproducción offline, la decisión queda bloqueada; no se implementa
un algoritmo “parecido”.

## Línea base del repositorio

Corte documental del worktree actual:

| ID | Consumidor | Evidencia | Autoridad | Resultado |
| --- | --- | --- | --- | --- |
| `MD-CONS-001` | GitHub repository UI | remote `origin` apunta a `github.com/Adayala/maitre.git` | `PRIMARY_CANDIDATE` | `OBSERVED` |
| `MD-CONS-002` | GitHub Actions/CI Markdown parser | directorio `.github` ausente | `UNASSESSED` | `ABSENT` |
| `MD-CONS-003` | docs site generator | sin config/dependencias/scripts detectables | `UNASSESSED` | `ABSENT` |
| `MD-CONS-004` | parser Markdown local del proyecto | sin dependencia/script detectable | `UNASSESSED` | `ABSENT` |
| `MD-CONS-005` | IDE/editor previews | configuración compartida no detectada | `UNASSESSED` | `UNKNOWN` |
| `MD-CONS-006` | exportador/API documental | configuración no detectada | `UNASSESSED` | `ABSENT` |

La búsqueda incluyó `.github`, manifests/lockfile y nombres habituales de generadores/parsers. Es
un baseline de configuración versionada, no prueba de que ninguna persona use previews locales.

## Interpretación del baseline

- GitHub es el único `PRIMARY_CANDIDATE` con evidencia observable.
- El remote confirma hosting, no versión de renderer/slugger, configuración de la UI ni aceptación
  de autoridad.
- No existe CI Markdown que pueda tratarse como autoridad secundaria.
- No se detectó sitio de documentación con semántica competidora.
- Los editores permanecen `UNKNOWN`; no se agregan a una intersección hasta demostrar materialidad.
- La estrategia multi-renderer continúa sin seleccionar.

## Evidencia de confirmación

Para promover `MD-CONS-001` se debe registrar:

```yaml
consumerConfirmation:
  consumerId: MD-CONS-001
  workflow:
    authorsUse: <evidence>
    reviewersUse: <evidence>
    approvalsOccurOn: <evidence>
  persistentLinksPublished: true | false
  rendererReproduction:
    profileRef: <RENDERER-NNN@revision>
    method: <locked component/container>
    fixtureOutcome: PASS
  authorityDecision:
    status: ACTIVE_PRIMARY
    owner: <ACCEPTED>
    reviewers: [<ACCEPTED>]
    reviewRef: <DOC-REV>
    effectiveFrom: <commit>
```

Declaraciones humanas pueden confirmar workflow/materialidad; no sustituyen hashes, versiones ni
fixtures técnicas.

## Cambios y drift

Se reabre el inventario cuando:

- cambia el host/remoto principal;
- aparece `.github` o un gate Markdown;
- se agrega un docs site, exporter o parser;
- una configuración compartida de editor pasa a ser requerida;
- se publican enlaces en otra superficie material;
- cambia el renderer/profile primario.

Un consumidor nuevo comienza `UNASSESSED`; no hereda autoridad del existente. Si interpreta
fragments de forma distinta, debe aplicarse la estrategia multi-renderer aprobada.

## Reporte determinista

```yaml
schemaVersion: 1
subjectCommit: <sha completo>
searchScope: [<paths/manifests>]
scopeHash: sha256:<hex>
consumers: [<records ordenados por consumerId>]
unknowns: [<preguntas/evidence faltante>]
```

El reporte no incluye paths absolutos, timestamps ni configuración personal fuera del repositorio.
`ABSENT` siempre declara scope de búsqueda; no significa inexistencia universal.

## Criterios de salida

- [x] Semántica de evidencia, materialidad y autoridad especificada.
- [x] Línea base de consumidores versionados relevada.
- [x] GitHub registrado como candidato, no como autoridad aprobada.
- [ ] Confirmar workflow real de autores/revisores.
- [ ] Identificar renderer/slugger reproducible para `MD-CONS-001`.
- [ ] Resolver materialidad de previews/editor.
- [ ] Seleccionar estrategia de consumidores secundarios.
- [ ] Emitir DOC-REV y promover un primary.

Los últimos cinco checks permanecen abiertos. `selectedProfile` continúa `NOT_CONFIGURED`.
