# Catálogo de fixtures NAVL schema v1 — SPEC-225

## Propósito

Definir casos de conformidad para el contrato de links y reachability Markdown sin convertirlos en
tests ejecutables. Cada fixture futura debe construir un repositorio mínimo aislado; no depende del
estado del worktree real.

## Formato

```yaml
id: NAVL-FIX-NNN
kind: POSITIVE | NEGATIVE | DETERMINISM
mode: COMMIT_GATE | WORKTREE_AUDIT | BASELINE_PROPOSAL
rendererProfile: <nombre@versión o NOT_CONFIGURED>
tree: [<paths y contenido mínimo>]
entrypoints: [<paths>]
baseline: [<findings o vacío>]
expected:
  exit: PASS | FAIL | AUDIT_ONLY
  codes: [NAVLxxx]
  linkClasses: [<clasificaciones>]
  documentClasses: [<clasificaciones>]
```

`PASS` significa conformidad mecánica, no aprobación documental. `AUDIT_ONLY` nunca habilita merge.

## Convenciones

- El profile ficticio `FIXTURE_RENDERER@1` sólo existe para fijar expectativas de headings; no
  selecciona el renderer productivo.
- El repositorio mínimo tiene case-sensitive Git index aunque la ejecución use otro filesystem.
- Los hashes y commits de ejemplo deben reemplazarse por valores válidos al materializar fixtures.
- Si un caso espera varios códigos, el catálogo indica todos los obligatorios; no admite errores
  adicionales.
- Cada fixture debe validar tanto resumen como findings ordenados.

## Casos positivos

### NAVL-FIX-001 — Link relativo a documento

`docs/README.md` enlaza `guide.md`; ambos están versionados y dentro del scope.

Expected: `PASS`; `VALID_DOCUMENT`; root y `DIRECTLY_REACHABLE`; sin códigos.

### NAVL-FIX-002 — Reachability indirecta

`README.md → a.md → b.md`.

Expected: `PASS`; `b.md` es `INDIRECTLY_REACHABLE`, distancia 2 y path testigo completo.

### NAVL-FIX-003 — Asset válido

Un Markdown enlaza `assets/schema.png` con sintaxis de imagen.

Expected: `PASS`; `VALID_ASSET`; el asset no se incorpora como nodo documental.

### NAVL-FIX-004 — Link de referencia

`[contrato][c]` posee definición `[c]: contract.md`.

Expected: `PASS`; un único edge aunque la definición esté después del uso.

### NAVL-FIX-005 — Fragment del mismo documento

Con `FIXTURE_RENDERER@1`, `#criterios-de-salida` resuelve un heading existente.

Expected: `PASS`; `SAME_DOCUMENT_FRAGMENT`.

### NAVL-FIX-006 — Fragment en otro documento

Link a `target.md#reglas`, heading único y profile configurado.

Expected: `PASS`; `VALID_DOCUMENT`; fragment resuelto.

### NAVL-FIX-007 — Query ignorada para identidad

`target.md?view=compact#reglas` resuelve el mismo nodo/fragment que `target.md#reglas`.

Expected: `PASS`; no duplica nodos.

### NAVL-FIX-008 — Ruta repository-relative

Desde un subdirectorio, `/docs/root.md` resuelve contra el repository root.

Expected: `PASS`; path normalizado `docs/root.md`.

### NAVL-FIX-009 — Link externo offline

Links `https:`, `mailto:`, `tel:` y `data:` válidos sintácticamente.

Expected: `PASS`; `EXTERNAL_NOT_CHECKED`; cero solicitudes de red y cero edges.

### NAVL-FIX-010 — Código y ejemplo excluidos

Links inexistentes dentro de fenced code, inline code y ejemplo marcado con
`sdd-link-check: ignore-example`.

Expected: `PASS`; los dos primeros no generan link; el tercero es `EXCLUDED_EXAMPLE` con ubicación.

### NAVL-FIX-011 — Symlink interno válido

Symlink versionado apunta a un archivo dentro del repositorio sin ciclo.

Expected: `PASS`; identidad canónica del destino, manteniendo raw target en el reporte.

### NAVL-FIX-012 — Componente cíclico alcanzable

Root enlaza `a.md`; `a.md ↔ b.md`.

Expected: `PASS`; ambos alcanzables; el ciclo se informa sin error de integridad.

### NAVL-FIX-013 — Exclusión vigente

Documento aislado posee exclusión versionada, owner, razón y condición de retiro vigentes.

Expected: `PASS`; `EXCLUDED_WITH_JUSTIFICATION`; no `NAVL010`.

### NAVL-FIX-014 — Finding baselineado

Un destino ausente coincide semánticamente con un finding vigente del baseline.

Expected: `PASS` bajo ratchet; reporte conserva `NAVL001` y `baselineFindingId`. El link continúa
clasificado `BROKEN`, nunca válido.

### NAVL-FIX-015 — Reducción de baseline

El destino previamente ausente existe y el baseline propuesto retira el finding.

Expected: `PASS`; reducción 1→0; el ID retirado no se reasigna.

## Casos negativos por código

### NAVL-FIX-016 — Destino ausente

Expected: `FAIL [NAVL001]`.

### NAVL-FIX-017 — Escape por parent traversal

`../../outside.md` resuelve fuera del repository root.

Expected: `FAIL [NAVL002]`; el scanner no lee el destino.

### NAVL-FIX-018 — Casing incorrecto

Git contiene `Contract.md`, source enlaza `contract.md`.

Expected: `FAIL [NAVL003]` incluso en filesystem case-insensitive.

### NAVL-FIX-019 — Percent-encoding inseguro

Casos independientes: `%00`, secuencia UTF-8 inválida, `%2F` y `%5C`.

Expected: `FAIL [NAVL004]` para cada caso; nunca se decodifica dos veces.

### NAVL-FIX-020 — Directorio implícito

Existe `guide/README.md`, pero el link apunta sólo a `guide/`.

Expected: `FAIL [NAVL005]`; no se infiere README.

### NAVL-FIX-021 — Symlink inseguro

Subcasos independientes: escape fuera del repositorio, destino ausente y ciclo.

Expected: `FAIL [NAVL005]` para cada subcaso.

### NAVL-FIX-022 — Fragment inexistente

Archivo existe, profile configurado, heading no existe.

Expected: `FAIL [NAVL006]`.

### NAVL-FIX-023 — Fragment ambiguo

El profile no puede producir una identidad inequívoca para un atributo explícito duplicado.

Expected: `FAIL [NAVL006]`; no selecciona el primero por orden accidental.

### NAVL-FIX-024 — Referencia sin definición

Expected: `FAIL [NAVL007]`.

### NAVL-FIX-025 — Link HTML

`<a href="target.md">...</a>` con parser HTML no aprobado.

Expected: `FAIL [NAVL008]`; no se ignora silenciosamente.

### NAVL-FIX-026 — Root inválido

Subcasos: root ausente y root configurado fuera de included roots.

Expected: `FAIL [NAVL009]`.

### NAVL-FIX-027 — Huérfano verdadero

Existe `orphan.md`, no está alcanzado desde roots y no posee exclusión.

Expected: `FAIL [NAVL010]`; clasificación `TRUE_ORPHAN`.

### NAVL-FIX-028 — Exclusión inválida

Subcasos: sin owner, sin razón, vencida y path que ya no coincide.

Expected: `FAIL [NAVL011]`; el documento no queda oculto del inventario.

### NAVL-FIX-029 — Crecimiento de baseline

Aparece un nuevo link roto que no coincide con findings vigentes.

Expected: `FAIL [NAVL001, NAVL012]`; `BASELINE_PROPOSAL` puede describirlo, pero no aprobarlo.

### NAVL-FIX-030 — Drift de finding

Mismo `baselineFindingId`, pero cambian source, target o código.

Expected: `FAIL [NAVL012]`; mover líneas solamente no es drift.

### NAVL-FIX-031 — Reaparición de ID retirado

Un finding resuelto vuelve a presentarse con el mismo ID histórico.

Expected: `FAIL [NAVL012]`.

### NAVL-FIX-032 — Fragment sin renderer

Existe link con fragment y `rendererProfile: NOT_CONFIGURED`.

Expected: `FAIL [NAVL006]` en `COMMIT_GATE`, con estado diagnóstico `NOT_CONFIGURED`; el scanner no
afirma que el fragment sea inválido ni lo marca `PASS`.

## Separación de modos

### NAVL-FIX-033 — Worktree dirty

Commit válido; el worktree elimina el destino y agrega un Markdown untracked.

Expected: `WORKTREE_AUDIT = AUDIT_ONLY`, informa ambos estados del snapshot. La ejecución
`COMMIT_GATE` sobre el mismo commit permanece `PASS`.

### NAVL-FIX-034 — Proposal no aprueba baseline

`BASELINE_PROPOSAL` serializa un finding nuevo con campos completos.

Expected: `AUDIT_ONLY`; no modifica el baseline ni cambia el resultado fallido de `COMMIT_GATE`.

## Determinismo y seguridad

### NAVL-FIX-035 — Orden de filesystem variable

Los mismos archivos se enumeran en órdenes distintos.

Expected: payloads comparables byte-idénticos; findings, nodos y edges ordenados.

### NAVL-FIX-036 — Dos paths testigo mínimos

Dos rutas de igual distancia alcanzan el mismo nodo.

Expected: predecessor lexicográficamente menor, independientemente del orden de lectura.

### NAVL-FIX-037 — Línea cambia

Un finding baselineado se desplaza de línea sin cambiar código/source/target.

Expected: conserva identidad y no produce `NAVL012`; el reporte muestra la línea actual.

### NAVL-FIX-038 — Backslash portable

Source usa `folder\target.md` y sólo existe `folder/target.md`.

Expected: `FAIL [NAVL001]`; no convierte backslash en separador.

### NAVL-FIX-039 — Path fuera de scope

Destino válido dentro del repositorio pero fuera de `includedRoots`.

Expected: integridad válida, clasificación `OUT_OF_SCOPE`, cero edge de reachability.

### NAVL-FIX-040 — Scope hash cambia

Mismo commit, distinta lista de roots, exclusions o renderer profile.

Expected: cambia `scopeHash`; un baseline de otro scope no se reutiliza y produce `NAVL012`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| extracción/clasificación | 001, 003–004, 009–010, 024–025, 039 |
| rutas/encoding/casing | 007–008, 017–021, 038 |
| fragments/renderer | 005–006, 022–023, 032 |
| reachability/grafo | 002, 012–013, 026–028, 036, 039 |
| baseline/ratchet | 014–015, 029–031, 034, 037, 040 |
| modos/worktree | 033–034 |
| determinismo/seguridad | 017, 019, 021, 035–040 |

Todos los códigos `NAVL001`–`NAVL012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Casos positivos, negativos y de determinismo especificados.
- [x] Todos los subcódigos `NAVL` cubiertos.
- [x] Integridad, assets y reachability diferenciados.
- [x] Commit gate, worktree audit y baseline proposal diferenciados.
- [ ] Seleccionar y aprobar renderer profile productivo.
- [ ] Materializar árboles y expected outputs como fixtures ejecutables.
- [ ] Implementar scanner y ejecutar catálogo.
- [ ] Registrar DOC-REV sobre catálogo, profile e implementación.

Los últimos cuatro checks permanecen abiertos.
