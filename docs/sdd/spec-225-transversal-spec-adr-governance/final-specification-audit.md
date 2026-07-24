# Auditoría final de especificación — SPEC-001–226

**Fecha de corte:** 2026-07-22

## Resultado

Los 19 bloques poseen ahora decisiones normativas para los findings semánticos relevados y las 226
specs contienen el paquete documental base completo. Esto no significa aprobación: persisten deuda
de metadata, navegación de README pendiente y evidencia externa no ejecutada.

## Inventario reproducible del checkout

| Hallazgo | Cantidad | Alcance | Estado Git |
| --- | ---: | --- | --- |
| Directorios de spec | 226 | SPEC-001–226 | mixto |
| Specs con los 9 artefactos base | 226 | README, specification, contract, objective, rules, structure, plan, tasks y verification | completo |
| README versionados con metadata estructural completa | 90 | ID, Tipo, Dominio, Estado, Readiness, Prioridad, Owner, Reviewer y Fase | completo; valores pendientes permanecen explícitos |
| Artefactos base ausentes | 0 | SPEC-001–226 | resuelto |
| `structure.md` incorporados | 20 | SPEC-207–226 | pendiente de review |
| README legado `Status: DRAFT` + Type/Phase/Priority TBD | 136 | 055–065, 071–080, 087–097, 102–144, 146–206 | todos no versionados |
| Archivos con tokens de shell/template corruptos | 0 | saneados en 055–064 y 071–078 | resuelto, pendiente de review |
| Auxiliares reescritos | 100 | 055–064 y 071–078 | versionados, sin checks ejecutados |
| README con `UNASSIGNED` | 90 | varios bloques | versionados |
| Readiness `WALKING_SKELETON_I0` | 24 | implementación adelantada | no canónico |
| Readiness `BLOCKED` | 21 | transversal/gobernanza | canónico |

Los conteos se obtuvieron con búsqueda textual sobre el checkout actual. Deben regenerarse antes de
cada lote; no se usan como identidad estable.

La fase faltante de 21 entidades versionadas se derivó de la hoja de ruta vigente: Floor, Ordering
y Kitchen corresponden a Fase 2; Reservations corresponde a Fase 3. Esta normalización no asigna
prioridad, owner o reviewer y no modifica readiness.

### Consistencia catálogo–README

El corte versionado contiene 90 filas de catálogo y 90 README raíz comparables. Para cada SPEC se
contrastaron `Tipo`, `Dominio`, `Fase`, `Prioridad`, `Estado` y `Readiness`; el resultado es cero
divergencias. `ID` se valida además contra el prefijo del directorio.

Reglas de autoridad:

- `SPECS.md` es el índice agregado, no una fuente independiente para promover estados;
- el README raíz presenta la metadata de la spec y debe reflejar la misma decisión;
- una modificación normativa actualiza ambos archivos en el mismo cambio;
- una diferencia bloquea la revisión hasta identificar la decisión fuente;
- `UNASSIGNED`, `NOT_ASSESSED` y `BLOCKED` son valores explícitos válidos, no campos ausentes;
- los README no versionados quedan fuera de la comparación hasta completar su migración con
  ownership confirmado.

### Identidad de artefactos base

Cada artefacto base debe declarar al menos una vez el `SPEC-NNN` propio de su directorio. Las
referencias a otras specs son dependencias legítimas y no constituyen contradicciones; por eso el
control verifica presencia del ID propio y no exige exclusividad.

Se normalizaron 56 archivos versionados de SPEC-006–016 que no declaraban su identidad: 6
`objective.md`, 9 `rules.md`, 11 `structure.md`, 10 `plan.md`, 10 `tasks.md` y 10
`verification.md`. La incorporación es editorial mediante `Spec: SPEC-NNN`; no modifica contenido
normativo, estados ni evidencia. El resultado para artefactos base versionados es cero identidades
propias ausentes.

Permanecen fuera de esta normalización 143 archivos locales no versionados: 136 README placeholders,
4 objectives y 3 specifications. Deben atravesar el flujo de ownership y migración antes de ser
editados o incorporados.

### Encabezados de contratos primarios

`specification.md` y `contract.md` deben tener exactamente un primer encabezado H1 y ese encabezado
debe incluir el `SPEC-NNN` propio. Otros IDs pueden aparecer en el cuerpo como dependencias, pero no
pueden sustituir la identidad primaria ni volver ambiguo el H1.

El relevamiento cubre 452 contratos primarios:

- 226 de 226 `contract.md` cumplen el encabezado requerido;
- 223 de 226 `specification.md` cumplen el encabezado requerido;
- las tres excepciones son archivos locales no versionados de SPEC-013, SPEC-014 y SPEC-015 cuyo H1
  es únicamente `Specification`.

Esas tres excepciones quedan bloqueadas por ownership. Su corrección futura debe limitarse a
incorporar el ID propio al H1, conservar el contenido y pasar la revisión de archivos no versionados;
esta auditoría no las sobrescribe ni presume autorización para incorporarlas.

### Ruta legacy de SPEC-001

La ruta versionada histórica `docs/sdd/spec-entity-tenant/` está ausente en el checkout, mientras
`docs/sdd/spec-001-entity-tenant/` es la ruta canónica activa. La ausencia corresponde a cambios
locales preexistentes y no se interpreta como retiro aprobado.

El [contrato de retiro](legacy-path-retirement-contract.md) define autoridad, clasificación de
referencias, preservación de historia y evidencia de aceptación. Las menciones restantes en guías
son etiquetas históricas no navegables; el cierre sigue `PENDING_REVIEW` hasta confirmar procedencia,
comparar contenido y registrar el outcome contra un commit.

El paquete base se define por presencia de `README.md`, `specification.md`, `contract.md`,
`objective.md`, `rules.md`, `structure.md`, `plan.md`, `tasks.md` y `verification.md` en cada
directorio. Los reportes especializados de revisión son evidencia adicional y no un décimo archivo
uniforme: sus nombres dependen del hallazgo y no se deben reemplazar por stubs `review-report.md`.

## Navegación documental

La presencia de artefactos está cerrada, pero no equivale a navegación completa. El relevamiento
separó navegación versionada de placeholders locales. Los 20 README versionados de SPEC-207–226
que no enlazaban su `contract.md` fueron completados; todos los README versionados enlazan ahora
`contract.md` y `specification.md`. Los 136 README no versionados todavía carecen de ambos enlaces
y se resuelven mediante el manifiesto de migración y revisión de ownership, sin sobrescribir trabajo
local ni fabricar enlaces en archivos cuya procedencia todavía no fue confirmada.

### Contrato del relevamiento de enlaces

Un gate futuro de enlaces Markdown debe:

- normalizar destinos equivalentes con o sin prefijo `./` antes de computar cobertura;
- resolver destinos relativos desde el directorio del documento que contiene el enlace;
- ignorar URLs externas, anchors internos, `mailto:` y `data:`;
- excluir contenido dentro de bloques de código fenced, porque representa templates y ejemplos;
- reportar por separado destinos ausentes por cambios locales no incorporados;
- fallar sólo por enlaces navegables rotos en contenido documental efectivo.

En el corte actual se corrigieron cinco referencias navegables al slug histórico de SPEC-001 y una
al slug histórico de SPEC-210. Las trece coincidencias de `_guides` están dentro de ejemplos fenced
y no son enlaces efectivos. Dos referencias a `notes.md` permanecen condicionadas por eliminaciones
locales preexistentes en SPEC-002 y SPEC-145; esta auditoría no restaura ni consolida esos cambios.

## Autoridad documental durante la remediación

Para SPEC-055–064 y 071–078, `specification.md` y `contract.md` contienen el contrato normativo
actual. Los 100 auxiliares antes clasificados `INVALID_PLACEHOLDER` fueron reescritos con objetivos,
reglas, estructura, plan, tareas y verificaciones específicas; ninguna verificación fue marcada.

Un checkbox previo, texto “CRUD working” o estimación genérica no constituye evidencia. Hasta su
reescritura, la verificación se deriva de criterios normativos de specification/contract y se
mantiene sin marcar.

## Migración de los 136 README no versionados

No deben sobrescribirse automáticamente: son trabajo local no trackeado. El procedimiento es:

1. inventariar path, hash y origen; confirmar si se conserva, integra o descarta con su autor;
2. migrar tabla a campos canónicos `ID, Tipo, Dominio, Estado, Readiness, Review target, Prioridad,
   Owner, Reviewer, Fase, Depende de, Blockers`;
3. derivar sólo datos objetivos del path/catálogo: ID y tipo (`entity`, `api`, `event`, `calculation`,
   `rules`, `rbac`, `workflow`, `connector`, `integration`, `ai`, `transversal`);
4. usar `Estado: DRAFT`, `Readiness: BLOCKED`, owner/reviewer `UNASSIGNED` y blocker de review para
   placeholders; no inventar prioridad ni aprobación;
5. serializar dependencias desde contratos de autoridad/reviews, validar DAG y links;
6. enlazar todos los artefactos presentes, sin afirmar que están completos;
7. revisar por bloque y recién entonces agregar a Git.

Type/phase pueden inferirse mecánicamente y ser revisados. Priority, owner, reviewer, approval y
estado superior requieren decisión humana.

## Reescritura de los 100 auxiliares corruptos — completada documentalmente

Cada spec afectada recibe:

- objective: problema, outcome y exclusiones;
- rules: invariantes normativas, no slogans genéricos;
- structure: inputs/outputs/IDs y referencias al contrato;
- verification: escenarios observables sin checks completados;
- plan: secuencia documental/implementación futura sin estimación inventada;
- tasks: unidades derivadas de acceptance criteria, todas pendientes.

El reemplazo se completó por spec/lote. La búsqueda global devuelve cero tokens corruptos fuera de
la mención histórica de este informe. El validador debe mantener `SDD004` para impedir regresiones.

## Hallazgos que siguen bloqueados por evidencia externa

- owners/reviewers y outcomes contra commit exacto;
- revisión retroactiva de implementación adelantada;
- ADR-002/003/004 y SPK-01–06;
- provider projects, credenciales y custodia;
- quality baseline ejecutada;
- cuotas/costos medidos;
- restore, RPO/RTO y exit exercise;
- revisión fiscal/laboral competente;
- spikes por provider, ML/LLM y conectores.

Todo resultado comienza `NOT_RUN`, `NOT_MEASURED` o `INCONCLUSIVE` según corresponda. Ningún texto de
esta auditoría promueve una spec a READY_FOR_IMPLEMENTATION o VERIFIED.

El [contrato de asignación](ownership-assignment-contract.md) cierra la semántica de propuesta,
aceptación, vigencia, conflictos y offboarding. No cierra la evidencia: 89 de 90 owners y los 90
reviewers de README versionados siguen `UNASSIGNED`; ninguna identidad se infiere ni se replica entre
scopes.

El [contrato de prioridad](spec-priority-contract.md) separa prioridad de spec, fase, severidad y
prioridad operativa. El inventario versionado conserva 51 `P0`, 18 `P1` y 21 `UNASSIGNED`; estas
últimas requieren decisión de Product/Domain Owner y no se completan por inferencia.

El [contrato de dependencias](dependency-relation-contract.md) separa precedencia de evaluación,
validación y navegación, y distingue `N/A` de `UNASSESSED`. Sólo 20 de 90 README versionados
declaran actualmente `Depende de`; los 70 restantes requieren revisión por bloque y no se convierten
en `N/A` por ausencia.

El [contrato de lifecycle/readiness](lifecycle-readiness-contract.md) registra 36 specs
`IN_PROGRESS/WALKING_SKELETON_I0` con readiness no canónica y 26 README con blockers fuera de
`BLOCKED`. Se especificó la migración por revisión retroactiva, sin reemplazos globales ni promoción
automática.

El [contrato de targets/blockers](review-target-blocker-contract.md) registra 71 README sin review
target explícito y 40 blockers con formulación genérica. La ausencia se clasifica `UNASSESSED`
durante migración; no se inventan targets, owners ni IDs para aparentar cierre.

El [registro retroactivo](retroactive-implementation-review-register.md) identifica commits
candidatos para las 36 specs `IN_PROGRESS`. La cobertura nominal es 36/36, pero ningún README enlaza
todavía un manifest, ningún gate histórico fue reconstruido y no existen outcomes: todas las filas
permanecen `CANDIDATE_OBSERVED`.

El [contrato de identidad de criterios](acceptance-criteria-identity-contract.md) define IDs,
granularidad, lifecycle y outcomes. La línea base es 0 de 226 `verification.md` con IDs propios;
la migración requiere clasificación semántica por bloque y no se resuelve con renumeración global.

El [contrato de tareas](task-traceability-contract.md) define IDs, tipos, dependencias y cierre. La
línea base contiene 800 checkboxes en 226 `tasks.md`, ninguno con IDs propios; 25 checks históricos
marcados en 10 archivos requieren evidencia o finding y no se consideran validados por su marca.

El [contrato de identidad de reglas](rule-identity-traceability-contract.md) define IDs canónicos,
aliases, lifecycle y mapping hacia criterios. La línea base es 0 de 226 `rules.md` con formato
canónico; SPEC-001, 004 y 023 aportan 43 aliases legacy que deben preservarse.

El [contrato de planes](plan-milestone-contract.md) define IDs de hitos, diferencia fase de producto
de etapa local y exige supuestos para estimaciones. La línea base es 0 de 226 planes con IDs, 59
encabezados “Fase” por clasificar y 51 archivos con tiempos legacy por auditar.

El [contrato de objetivos](objective-outcome-contract.md) define IDs, alcance, exclusiones y señales
de éxito sin imponer KPIs ficticios. La línea base es 0 de 226 objectives con IDs; 198 documentos
breves se tratan como señal de revisión, no como defecto automático.

El [contrato de requisitos](requirement-identity-contract.md) define IDs, tipos y fuerza normativa.
La línea base es 0 de 226 specifications con IDs; sólo 28 contienen keywords normativos detectables
y las otras 198 requieren clasificación, no inserción mecánica de `MUST`.

El [contrato de versión/compatibilidad](contract-version-compatibility-contract.md) separa identidad
de spec, revisión documental y schema observable. Los 226 contratos permanecen
`UNVERSIONED_LEGACY`; 36 mencionan compatibilidad sin metadata uniforme y ninguno declara revisión.

El [contrato de estructura](structure-boundary-contract.md) define IDs, autoridad, dirección,
fallos y seguridad de boundaries. La línea base es 0 de 226 estructuras con IDs; los 20 documentos
de SPEC-207–226 se clasifican `DOCUMENT_SKELETON`, no diseño de solución aprobado.

El [contrato del grafo](traceability-graph-contract.md) define nodos, edges, cardinalidades,
excepciones y cobertura. Aunque existen contratos de identidad para siete tipos, la línea base aún
posee 0 nodos y 0 edges canónicos; toda cobertura permanece `UNMAPPED`.

El [contrato de lotes](document-migration-batch-contract.md) define baseline, mappings, ratchet,
review y rollback para migrar sin cambios masivos ni semántica inventada. El primer lote propuesto es
SPEC-225 como piloto documental; todavía no fue ejecutado.

El manifest [SDD-MIG-001](migrations/sdd-mig-001-spec-225-pilot.md) permanece `PLANNED`: scope,
exclusiones, métricas y condiciones están especificados, pero baseline/owner/reviewers siguen
`NOT_FROZEN` o `UNASSIGNED`.

El [schema de mappings](migration-mapping-schema-contract.md) define clasificación, hashes,
splits/merges, aliases, conflictos, edges y checks legacy. Está especificado como schemaVersion 1,
pero continúa pendiente de aprobación y fixtures; no habilita todavía el baseline del piloto.

El [catálogo de fixtures](migration-mapping-fixture-catalog.md) especifica 20 escenarios y 14 códigos
de error. Cierra la definición de casos, no su ejecución: faltan archivos ejecutables, validator y
aprobación.

El [contrato de snapshot](worktree-baseline-snapshot-contract.md) especifica estados Git, hashes,
provenance, freeze y staleness para trabajar sin pisar cambios concurrentes. SDD-SNAP-001 no fue
tomado: baseline y snapshot del piloto permanecen `NOT_FROZEN`.

El [catálogo SNAP](worktree-snapshot-fixture-catalog.md) especifica 20 escenarios y 12 códigos,
incluidos dirty/deleted/untracked, paths sensibles y concurrencia. No existen fixtures ejecutables ni
snapshot validator.

El [manifest SDD-SNAP-001](worktree-snapshot-pilot-manifest.md) expande los nueve paths de
SDD-MIG-001 y observa 5 tracked-clean, 3 tracked-modified y 1 untracked (`structure.md`). Permanece
`DRAFT`: todos están en `PRESERVE`, provenance del untracked está `UNKNOWN`, hashes en cero y ningún
path está autorizado como `EDIT_IN_BATCH`.

El [contrato DOC-REV](document-review-evidence-contract.md) define subject, paths, dimensiones,
reviewer, outcome y staleness para revisiones documentales. Ningún DOC-REV fue emitido y un
`APPROVE` futuro no probará implementación ni promoverá lifecycle automáticamente.

El [catálogo DOC-REV](document-review-fixture-catalog.md) especifica 22 casos y 12 códigos para
approval, findings, bloqueo, conflictos y staleness. No existen fixtures ejecutables ni validator.

El [contrato de navegación](document-role-navigation-contract.md) define roles, autoridad, índices y
huérfanos. Los seis Markdown raíz no enlazados de SPEC-225 fueron incorporados a su README; esta
mejora de navegación no aprueba su contenido.

El [contrato de metadata documental](document-metadata-envelope-contract.md) define front matter,
IDs `SDD-DOC-*`, roles, status, invariantes, migración, ratchet y códigos `DOCM001`–`DOCM012`. El
baseline contiene 2.153 Markdown tracked y 2.188 presentes; cobertura canónica 0 en ambos universos.
Las coincidencias `role:` observadas son ejemplos/propuestas, no envelopes aplicados.

El [catálogo DOCM](document-metadata-fixture-catalog.md) especifica 50 escenarios para roles,
status, identidad, spec ownership, autoridad, derivación, successors, mappings, ratchet, seguridad,
versiones y determinismo. No existen fixtures ejecutables, parser ni aprobación del schema.

El [piloto SDD-DOCM-001](document-metadata-pilot-manifest.md) propone mappings para los índices de
reviews/evidence, con IDs `PENDING_ALLOCATION`, body/link/outcome changes en cero y preservación por
hash. Permanece `PLANNED`: schema, assignees, snapshot, provenance, allocator y refs siguen
pendientes de aprobación/inicialización o reconciliación; ningún envelope fue aplicado.

El [contrato de document IDs](document-id-registry-allocation-contract.md) define namespace,
registro, allocation atómica, concurrencia, aliases, movimientos, split/merge, rollback, tombstones
y códigos `DIDA001`–`DIDA012`. El registro no existe, `allocatedIds=0` y `nextId` permanece
`NOT_INITIALIZED`; no se reservó ningún número.

El [catálogo DIDA](document-id-registry-fixture-catalog.md) especifica 52 escenarios para
inicialización parametrizada, asignación, concurrencia, registry/envelope consistency, aliases,
moves, split/merge, retiro, rollback, tombstones, seguridad y versiones. No existen fixtures
ejecutables ni allocator.

El [contrato de preservación del body](document-body-preservation-contract.md) define inserción,
extracción y round-trip byte-exactos, precondiciones UTF-8/sin BOM/LF, diff permitido, staleness,
rollback y códigos `DOCB001`–`DOCB012`. Los dos índices del piloto son elegibles por formato
observado, pero tienen hashes sin congelar y cero round-trips ejecutados.

El [catálogo DOCB](document-body-preservation-fixture-catalog.md) especifica 48 escenarios para
inserción, extracción, round-trip, BOM/CRLF, front matter, delimitadores, byte drift, diff,
staleness, determinismo, seguridad y lifecycle DIDA. No existen byte fixtures, expected hashes ni
transformer.

El [contrato de referencias tipadas](document-reference-identity-contract.md) define tipos,
relations, resolution modes, legacy paths, lifecycle, grafo y códigos `DREF001`–`DREF012`. Las
cuatro refs `PATH:` de `SDD-DOCM-001` siguen `UNRESOLVED_LEGACY_PATH`; ninguna se convirtió
automáticamente en document ID.

El [catálogo DREF](document-reference-fixture-catalog.md) especifica 50 escenarios para tipos,
relations, revisions, lifecycle, estrategias legacy, pérdida de autoridad, cycles, drift,
seguridad y determinismo. No existen fixtures ejecutables ni resolver.

El [contrato de índices de subdirectorios](subdirectory-index-contract.md) relevó tres directorios
anidados. Dos superan el umbral y poseen README con cobertura directa 31/31; `migrations/` contiene
un único artifact y queda bajo umbral. La línea base `NAVD001/002` es cero, pero falta metadata
lógica, fixtures ejecutables y gate.

El [catálogo NAVD](subdirectory-index-fixture-catalog.md) especifica 34 escenarios para umbral,
colecciones, cobertura directa, nesting, parent links, exclusiones, lifecycle, transiciones,
ratchet y determinismo. No existen árboles/expected reports ejecutables ni gate.

El [registro de metadata de índices](subdirectory-index-metadata-register.md) propone `indexRole:
GUIDE` para ambos índices y separa roles de sus colecciones. Registra `NAVD-META-001/002` como
`OWNERSHIP_BLOCKED`: cobertura y parent→index pasan, pero metadata y backlink explícito al parent no
están aplicados. No se editaron los índices ni sus 31 hijos.

La [línea base global](global-navigation-baseline.md) registró 289 candidatos sin enlace directo en
84 specs con README versionado y 1.088 en los 136 placeholders locales. El análisis intradirectorio
posterior clasificó los 289 versionados como `TRUE_ORPHAN`: 279
artefactos base y 10 contratos especializados; cero fueron alcanzables indirectamente. La
remediación NAV-01/NAV-02 permanece pendiente y NAV-03 sigue bloqueado por ownership.

Los [manifests NAV](navigation-remediation-manifests.md) especifican template, sub-lotes y ratchets
10→0 y 279→0. Permanecen `PLANNED`, con snapshot `NOT_FROZEN` y responsables `UNASSIGNED`.

El [contrato de índices globales](global-index-navigation-contract.md) registra reachability 0/226
desde START_HERE, INDEX, SPECS y su unión. NAV-04A apunta a 90/90 README versionados; NAV-04B queda
`BLOCKED` hasta registrar los 136 locales.

El [registro de links rotos](broken-link-remediation-register.md) conserva LINK-001/002 como
`OWNERSHIP_BLOCKED`: ambos apuntan a `notes.md` rastreados pero eliminados localmente. No se
restauraron destinos ni se quitaron links para maquillar el baseline.

El [contrato de links y reachability](markdown-link-reachability-contract.md) separa integridad de
destinos, validación de fragments y alcanzabilidad desde roots. Especifica resolución segura,
symlinks, casing, grafo, reporte determinista, subcódigos `NAVL001`–`NAVL012` y ratchet. El scanner,
el renderer profile y las fixtures ejecutables todavía no existen ni fueron aprobados.

El [catálogo NAVL](markdown-link-fixture-catalog.md) especifica 40 escenarios que cubren extracción,
rutas, fragments, assets, reachability, baseline, modos, seguridad y determinismo. Todos los
subcódigos poseen caso negativo, pero los árboles/outputs ejecutables, el renderer productivo, el
scanner y su DOC-REV continúan pendientes.

El [contrato de links externos](external-link-validation-contract.md) separa static gate offline de
auditoría de red programada, y define SSRF/DNS/redirect safety, HTTP outcomes, confirmación,
evidence, ratchet y códigos `XURL001`–`XURL012`. El baseline regex observa 40 URL-like strings en 14
archivos y 18 host tokens sin clasificarlos como links/dominios válidos; cero requests fueron
ejecutados.

El [catálogo XURL](external-link-validation-fixture-catalog.md) especifica 60 escenarios para
extracción, placeholders, SSRF, DNS rebinding, redirects, TLS, request limits, HTTP outcomes,
confirmación, evidence, ratchet y seguridad. No existen fixtures simuladas ni auditor.

El [contrato de autoría ADR](adr-authoring-readiness-contract.md) define template lógico, seis
change classes, assessment, checklist `ADR-RDY-01`–`14`, gates de evidence, transiciones y códigos
`ADRT001`–`ADRT012`. ADR-001–004 se registran como legacy observado; no se creó template físico ni
se cambió estado alguno.

El [catálogo ADRT](adr-authoring-fixture-catalog.md) especifica 52 escenarios para template,
contexto, opciones, decisión, consecuencias, evidence, rollback, change class, lifecycle,
supersession, deciders, refs y seguridad. No existen fixtures ejecutables ni parser.

El [catálogo integrado del validador](sdd-validator-fixture-catalog.md) especifica 60 escenarios
para `SDD001`–`SDD008`, `ADR001/002`, subcódigos, baseline, cycles, lifecycle, projections,
read-only, ausencia de red y stdout determinista. No existen repositorios fixture ni
`npm run sdd:validate`.

El [contrato CI del validador](sdd-validation-ci-integration-contract.md) define eventos, trust,
permisos, runtime, rollout shadow/ratchet/strict, outcomes, aggregator, concurrency, artifacts,
baseline, canarios, budget y códigos `SDDCI001`–`SDDCI012`. Localmente no existen `.github`,
script, validator, fixtures materializadas ni check requerido; branch protection sigue
`UNASSESSED`.

El [catálogo SDDCI](sdd-validation-ci-fixture-catalog.md) especifica 60 escenarios para eventos,
forks, permisos, runtime, SHA, outcomes, writes/red, baseline, aggregator, concurrency, artifacts,
cache, rollout, canarios, budget y emergency. No existen fixtures de workflow/run ni CI.

El [contrato de baseline histórico](historical-validation-debt-baseline-contract.md) define
envelope, fingerprint semántico, elegibilidad, categorías no exceptuables, expiry, bootstrap,
delta, ratchet, successor y códigos `SDBL001`–`SDBL012`. Los conteos auditados se mantienen como
candidate inventory; no existe baseline activa y accepted entries permanece en cero.

El [catálogo SDBL](historical-validation-debt-baseline-fixture-catalog.md) especifica 52 escenarios
para schema, subject congelado, identidad, aceptación, categorías no exceptuables, expiry, delta,
ratchet, migrations, review, seguridad y determinismo. Cubre los doce códigos con 12 casos positivos
y 40 negativos; no existen árboles fixture, runner, ejecuciones ni baseline aceptada.

El [contrato del repositorio de baselines](historical-baseline-repository-contract.md) propone
`.sdd/baselines/validation`, separa pointer, history y evidence, y especifica resolución segura,
hashes, activación atómica, inmutabilidad, concurrencia, ownership, compatibilidad, recovery y
códigos `SDBS001`–`SDBS012`. La ruta no fue creada ni aprobada; no hay pointer, history, evidence o
baseline activa.

El [catálogo SDBS](historical-baseline-repository-fixture-catalog.md) especifica 52 escenarios para
root/layout, pointer, hashes, historia inmutable, estados, evidence, activación atómica, concurrencia,
autorización, seguridad, compatibilidad, authority, determinismo y recovery. Cubre los doce códigos
con 12 positivos y 40 negativos; no existen árboles, runner, ejecuciones ni root físico.

El [contrato de excepciones de deuda](validation-debt-exception-governance-contract.md) especifica
elegibilidad, solicitud, segregación, autoridad, lifecycle, consumo único, vigencia, renovación,
revocación, precedentes, evidence, ratchet y códigos `SDEX001`–`SDEX012`. Las categorías críticas
continúan no exceptuables; no existe registro, solicitud, aprobación ni excepción consumida.

El [catálogo SDEX](validation-debt-exception-fixture-catalog.md) especifica 54 escenarios para
schema, identidad, elegibilidad, completitud, autoridad, segregación, review, consumo, expiry,
revocación, successor, anti-normalización, seguridad y determinismo. Cubre los doce códigos con 12
casos positivos y 42 negativos; no existen fixtures ejecutables, requests ni approvals.

El [policy profile de deuda](validation-debt-policy-profile-contract.md) propone
`SDD-DEBT-POLICY-001`, severidades, máximos de 30/60/90 días para excepciones, una única renovación,
authority matrix, secuencia de activación, versionado, prohibición de overrides y códigos
`SDBP001`–`SDBP012`. La policy, sus valores y assignments no están aprobados; `exception.enabled`
continúa en `false`.

El [catálogo SDBP](validation-debt-policy-fixture-catalog.md) especifica 56 escenarios para identidad,
resolución, severidad, vigencia, authority, renovación, activación, versionado, bypass, enforcement,
seguridad y determinismo. Cubre los doce códigos con 12 positivos y 44 negativos; no existen
fixtures ejecutables, policy efectiva ni exceptions habilitadas.

El [contrato de autoridad](authority-capability-delegation-contract.md) separa rol de capability y
define nueve capabilities, cinco risk tiers, matriz de actos, grupos verificables, delegación
acotada, escalamiento explícito, recusación, vigencia, proyecciones y códigos `OWNA001`–`OWNA012`.
No se eligió registry/provider ni se crearon assignments, delegations o authority relations.

El [catálogo OWNA](authority-capability-fixture-catalog.md) especifica 57 escenarios para schema,
identidad, grupos, memberships, scope, tiers, vigencia, segregación, delegación, escalamiento,
matriz de actos, invalidación, proyecciones, seguridad y determinismo. Cubre los doce códigos con 12
positivos y 45 negativos; no existen fixtures ejecutables ni autoridad asignada.

El [contrato del registro de ownership](ownership-authority-registry-contract.md) propone
`.sdd/governance/authority`, manifest, identity refs opacas, provider profiles, allocator,
tombstones, lifecycle, resolución, atomicidad, privacidad, drift, recovery y códigos
`OWNR001`–`OWNR012`. No se creó el root/manifest, no se eligió provider y hay cero records.

El [catálogo OWNR](ownership-authority-registry-fixture-catalog.md) especifica 60 escenarios para
root, manifest, revisions, allocator, identities, providers, integridad, historia, resolución,
concurrencia, drift, privacidad, seguridad, determinismo y recovery. Cubre los doce códigos con 12
positivos y 48 negativos; no existen fixtures ejecutables, registry ni identity records.

El [contrato de readiness de activación](governance-activation-readiness-contract.md) define manifest,
componentes congelados, gates `GAR-01`–`12`, requisitos y orden para shadow/ratchet/strict/exceptions,
evidence, staleness, aplicación, verificación, rollback, fail-closed y códigos
`GACT001`–`GACT012`. El modo actual permanece `NOT_CONFIGURED`; no existen activations aprobadas,
aplicadas o verificadas.

El [catálogo GACT](governance-activation-fixture-catalog.md) especifica 58 escenarios para manifest,
componentes, gates, transiciones, readiness, autoridad, compatibilidad, aplicación, verificación,
rollback, fail-closed, seguridad y determinismo. Cubre los doce códigos con 12 positivos y 46
negativos; no existen fixtures ejecutables, manifests de activación ni cambio de modo.

El [contrato de disponibilidad](validation-availability-continuity-contract.md) separa passed,
failed, unavailable, cancelled y stale; propone policy por modo, budgets, retries, fuente
autoritativa, degradación explícita, continuidad, recovery, medición y códigos
`VAVL001`–`VAVL012`. No hay policy/SLO/alertas/rollback efectivos ni runs observados.

El [catálogo VAVL](validation-availability-fixture-catalog.md) especifica 60 escenarios para policy,
clasificación, subject, budgets, retries, fuente autoritativa, degradación, rollback, recovery,
métricas, seguridad y determinismo. Cubre los doce códigos con 12 positivos y 48 negativos; no
existen fixtures ejecutables ni configuración operativa.

El [contrato de incident response](validation-incident-response-contract.md) define record,
severidades propuestas, roles, lifecycle, contención, comunicación, cadena de custodia, recovery,
root cause, corrective actions, cierre y códigos `VINC001`–`VINC012`. No hay registry, destinos,
cadencias aprobadas, on-call asignado ni incidentes creados.

El [catálogo VINC](validation-incident-response-fixture-catalog.md) especifica 58 escenarios para
record, detección, severidad, ownership, lifecycle, comunicación, contención, evidence, recovery,
root cause, cierre, seguridad y determinismo. Cubre los doce códigos con 12 positivos y 46
negativos; no existen fixtures ejecutables, incidents, alerts ni assignments.

El [contrato de renderer profile](markdown-renderer-profile-contract.md) especifica identidad,
versiones exactas, candidatos, semántica mínima, múltiples renderers, reporte y upgrades. El
baseline sintáctico contiene 10 links con fragment en 10 archivos, todos hacia SPEC-210; ninguno fue
validado porque el profile productivo permanece `NOT_CONFIGURED`.

El [catálogo de conformidad](markdown-renderer-conformance-fixture-catalog.md) define 48 inputs para
sintaxis, whitespace, puntuación, Unicode, contenido inline, duplicados, contextos, fragments,
determinismo y upgrades. Sus expectativas relacionales están especificadas, pero los IDs generados
continúan `UNRESOLVED` hasta observar y aprobar un renderer candidato.

El [inventario de consumidores](markdown-consumer-authority-contract.md) registra GitHub repository
UI como único `PRIMARY_CANDIDATE` observado por el remote `origin`. No hay `.github`, docs site,
parser Markdown ni script asociado detectables; previews de editor permanecen `UNKNOWN`. Hosting no
equivale a autoridad: faltan workflow confirmado, reproducción offline, assignees y DOC-REV.

El [registro de fragments](markdown-fragment-validation-register.md) reconcilia las 10 referencias
con un único target y 10 headings candidatos. Todas siguen `PENDING_PROFILE`: existe evidencia de
ruta/texto, pero cero outcomes `RESOLVED` hasta congelar hashes, activar profile y ejecutar
conformance sobre el commit revisado.

El [manifest MD-RENDER-001](markdown-renderer-selection-manifest.md) especifica baseline,
identidad/provenance de candidatos, ejecución 48+10, criterios eliminatorios, comparación,
ratchets, atomicidad, rollback y review. Permanece `PLANNED`, con snapshot/assignees sin resolver y
sin candidato ejecutado o seleccionado.

El [contrato de evidencia MD-RENDER](markdown-renderer-evaluation-evidence-contract.md) define
envelope, candidates, runs, observations, comparison, divergences, decision, findings y códigos
`RSEL001`–`RSEL012`. No existe package real, validator ni aprobación del schema.

El [catálogo RSEL](markdown-renderer-evaluation-fixture-catalog.md) especifica 42 escenarios para
packages válidos, provenance, runs, cobertura 48+10, determinismo, divergencias, findings,
decisiones, reviews, seguridad y staleness. Los casos no están materializados ni ejecutados.

## Orden de cierre

La [auditoría de cierre de definición](specification-definition-gap-audit.md) encuentra cero checks
abiertos cuyo objetivo sea especificar/definir/proponer dentro del marco transversal. El outcome es
`COMPLETE_PENDING_REVIEW`, no readiness del portfolio: el trabajo restante es materialización,
aprobación, migración y revisión por dominio.

1. Resolver ownership de los README no versionados.
2. Normalizar metadata/readiness mediante el manifiesto de migración.
3. Validar DAG, links, IDs, contracts y cero tokens corruptos.
4. Ejecutar gates/spikes/restore/budgets.
5. Realizar revisión humana por bloque y registrar commit/outcome.

El procedimiento y template para los 136 README está en
[manifiesto de migración](placeholder-readme-migration.md).

La revisión posterior de eventos, roles, lifecycles y autoridades está documentada en la
[auditoría de consistencia semántica](semantic-consistency-audit.md).
