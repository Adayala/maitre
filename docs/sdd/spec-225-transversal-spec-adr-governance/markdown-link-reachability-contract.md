# Contrato de links y reachability Markdown — SPEC-225

## Propósito

Especificar una interpretación única, offline y determinista de los links Markdown usados por los
gates de integridad y navegación. Este contrato no implementa el scanner ni modifica links.

Responde dos preguntas distintas:

1. **Integridad:** ¿el destino local referido existe y, cuando aplica, contiene el fragment?
2. **Reachability:** ¿un documento está alcanzable desde un root autorizado mediante links válidos?

Un link íntegro no vuelve autoritativo al destino y un documento existente no está necesariamente
alcanzable.

## Alcance de entrada

El scanner recibe explícitamente:

```yaml
scan:
  repositoryRoot: <path absoluto resuelto>
  subjectCommit: <sha completo>
  includedRoots:
    - docs/sdd
    - docs/adr
  entrypoints: [<paths relativos al repositorio>]
  baselineRef: <archivo versionado o null>
  caseMode: FILESYSTEM_NATIVE
  networkAccess: false
```

- Sólo se inspeccionan archivos versionados del `subjectCommit`.
- Un modo de auditoría de worktree debe llamarse explícitamente `WORKTREE_AUDIT`, registrar snapshot
  y no sustituye al gate sobre commit.
- Rutas fuera de `includedRoots` pueden ser destinos válidos, pero no se incorporan al grafo
  documental salvo configuración expresa.
- El scanner no sigue cambios untracked, ignored ni deletes locales cuando valida un commit.

## Extracción

Se reconocen:

- links inline `[texto](destino)`;
- imágenes `![alt](destino)`, sólo para integridad de assets;
- links de referencia `[texto][id]` y sus definiciones;
- autolinks locales únicamente si su sintaxis representa una ruta admitida.

Se excluyen:

- fenced code y bloques indentados de código;
- contenido dentro de inline code;
- ejemplos marcados con `sdd-link-check: ignore-example`;
- URLs con scheme `http`, `https`, `mailto`, `tel` o `data`;
- templates cuya ruta contenga tokens declarados y no instanciados.

Los links HTML se clasifican `UNSUPPORTED_SYNTAX` hasta que una revisión apruebe su parser. No se
ignoran silenciosamente. Las definiciones de referencia ausentes son error de sintaxis aunque no
produzcan una ruta.

## Normalización y resolución

Para cada destino local:

1. separar query y fragment sin decodificar la ruta completa;
2. percent-decodificar una vez cada segmento;
3. rechazar bytes nulos, encoding inválido y separadores codificados;
4. resolver contra el directorio del source;
5. normalizar `.` y `..`;
6. verificar que la ruta resuelta permanezca dentro de `repositoryRoot`;
7. comprobar el componente con el casing exigido por Git, aun en filesystem case-insensitive.

Reglas adicionales:

- `/ruta` se interpreta relativa al repositorio, no al filesystem.
- Una ruta vacía con `#fragment` refiere al mismo documento.
- Query strings no participan de existencia ni identidad.
- Un directorio no es documento: sólo es válido si el link nombra explícitamente su `README.md`.
- No se infieren extensiones ni `index.md`.
- Un symlink es válido únicamente si está versionado y su destino canónico permanece dentro del
  repositorio; un ciclo o escape es error.
- Backslashes no se convierten en separadores portables.

## Fragments

Para Markdown local, el fragment debe resolver a:

- un atributo de heading explícito soportado por el renderer aprobado; o
- el slug generado para un heading del destino.

La política de slug debe quedar fijada por `rendererProfile` y versión. Duplicados se numeran según
ese perfil. El match se realiza sobre el fragment percent-decodificado una vez.

Un archivo existente con fragment inexistente produce `NAVL006`. Los links sólo `#fragment` también
se validan. Assets binarios no admiten fragments y los query strings no los vuelven documentos.

Mientras no se apruebe un `rendererProfile`, la existencia de archivo puede auditarse pero el gate
de fragment queda `NOT_CONFIGURED`; no se presume `PASS`.

La selección, identidad, lifecycle y compatibilidad del profile están definidas en
`markdown-renderer-profile-contract.md`.

## Modelo del grafo

- Nodo documental: archivo Markdown versionado dentro del scope.
- Edge: link Markdown local, extraído y resuelto sin error, desde un nodo documental.
- Asset edge: link o imagen hacia archivo no Markdown; cuenta para integridad, no para reachability.
- Root: entrypoint explícito y existente.

El recorrido es dirigido y parte de todos los roots configurados. No atraviesa:

- links rotos;
- links externos;
- assets;
- documentos fuera del scope;
- exclusions;
- redirects/successors implícitos.

Clasificación de cada documento:

```text
ROOT | DIRECTLY_REACHABLE | INDIRECTLY_REACHABLE |
TRUE_ORPHAN | EXCLUDED_WITH_JUSTIFICATION
```

La distancia mínima y el predecessor lexicográficamente menor forman el path testigo. Un link de
vuelta no convierte un componente aislado en alcanzable. Los ciclos se reportan, pero sólo son error
si otra regla prohíbe esa relación.

## Clasificación de links

```text
VALID_DOCUMENT | VALID_ASSET | SAME_DOCUMENT_FRAGMENT |
EXTERNAL_NOT_CHECKED | EXCLUDED_EXAMPLE | OUT_OF_SCOPE |
UNSUPPORTED_SYNTAX | BROKEN
```

`EXTERNAL_NOT_CHECKED` no equivale a URL verificada. `OUT_OF_SCOPE` no crea edge, aunque el destino
exista. Toda exclusión material lleva razón y ubicación; no existen ignores globales anónimos.

## Códigos estables

| Código | Condición |
| --- | --- |
| `NAVL001` | destino local ausente |
| `NAVL002` | ruta escapa del repositorio |
| `NAVL003` | casing no coincide con Git |
| `NAVL004` | percent-encoding inválido o inseguro |
| `NAVL005` | directorio, symlink inválido o ciclo de symlink |
| `NAVL006` | fragment inexistente, ambiguo o no verificable por falta de renderer profile |
| `NAVL007` | referencia Markdown sin definición |
| `NAVL008` | sintaxis local reconocida pero no soportada |
| `NAVL009` | root inexistente o fuera de scope |
| `NAVL010` | documento huérfano sin exclusión vigente |
| `NAVL011` | exclusión ausente, vencida o sin justificación |
| `NAVL012` | crecimiento/drift de baseline |

`SDD005` es la categoría pública del validador; `NAVL001`–`NAVL012` son sus subcódigos de
diagnóstico. Cambiar significado requiere nueva versión del contrato y fixtures actualizadas.

## Reporte determinista

```yaml
schemaVersion: 1
subjectCommit: <sha completo>
rendererProfile: <nombre@versión o NOT_CONFIGURED>
scopeHash: sha256:<hex>
summary:
  documents: 0
  validDocumentLinks: 0
  validAssetLinks: 0
  brokenLinks: 0
  orphanDocuments: 0
findings:
  - code: NAVL001
    severity: ERROR
    source: <path>
    line: 0
    rawTarget: <texto>
    resolvedTarget: <path o null>
    fragment: <valor o null>
    baselineFindingId: <ID o null>
```

- Paths son relativos al repositorio y usan `/`.
- Findings se ordenan por `source`, `line`, `code`, `rawTarget`.
- Nodos y edges se ordenan lexicográficamente.
- No se incluyen timestamps, rutas absolutas, tiempos de ejecución ni orden del filesystem.
- `scopeHash` cubre configuración, entrypoints, exclusions y perfil de renderer.
- Dos ejecuciones sobre el mismo commit/configuración deben producir bytes equivalentes, salvo un
  campo de tool version expresamente excluido del payload comparable.

## Baseline y ratchet

Un finding baselineado posee ID estable, código, source, target, razón, owner, issue y condición de
retiro. La comparación es por identidad semántica; cambiar una línea no crea deuda “nueva”.

- Un finding nuevo falla.
- Un finding conocido que cambia de código, source o target falla como drift.
- Un finding resuelto reduce baseline y no puede reaparecer con el mismo ID.
- Una excepción vencida falla.
- El baseline nunca convierte un link en válido: sólo permite deuda identificada temporalmente.
- Un aumento no se acepta actualizando automáticamente el snapshot.

La línea base actual de links rotos contiene exactamente `LINK-001` y `LINK-002`; ambos deben
mapear a `NAVL001` y conservar estado `OWNERSHIP_BLOCKED` hasta decisión explícita.

## Modos y resultado

| Modo | Input | Efecto permitido |
| --- | --- | --- |
| `COMMIT_GATE` | commit + config versionada | read-only; falla ante regresión |
| `WORKTREE_AUDIT` | snapshot declarado | read-only; informa dirty/untracked/deleted |
| `BASELINE_PROPOSAL` | commit + findings revisables | genera propuesta, nunca la aprueba |

El scanner no corrige links, crea índices, restaura archivos, accede a red ni altera baseline.

## Criterios de aceptación

- [ ] Aprobar renderer/profile y schemaVersion.
- [x] Definir fixtures positivas y negativas para cada `NAVL`.
- [ ] Mapear LINK-001/002 sin duplicarlos.
- [ ] Probar salida byte-estable y orden determinista.
- [ ] Probar separación entre integridad, assets y reachability.
- [ ] Implementar el scanner sólo después de review del contrato.

Sólo quedó cerrado el diseño del catálogo. Los checks de aprobación, materialización, ejecución y
validación permanecen abiertos: este documento especifica comportamiento, no lo implementa.

Los casos normativos están especificados en `markdown-link-fixture-catalog.md`; que ese catálogo
exista no satisface los checks de materialización, ejecución ni aprobación.
