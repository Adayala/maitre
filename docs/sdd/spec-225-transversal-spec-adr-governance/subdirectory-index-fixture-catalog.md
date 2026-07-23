# Catálogo de fixtures NAVD schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para índices de subdirectorios documentales. Los árboles son
lógicos; este catálogo no crea directorios ni implementa el gate.

## Formato

```yaml
id: NAVD-FIX-NNN
kind: POSITIVE | NEGATIVE | TRANSITION | DETERMINISM
tree: [<paths/contenido mínimo>]
parentEntrypoint: <path>
exclusions: [<records>]
expected:
  outcome: ACCEPT | REJECT
  codes: [NAVDxxx]
  classification: COMPLIANT | BELOW_THRESHOLD | FINDING
```

Los casos ejecutables deberán incluir commit, scope hash y expected report completo.

## Umbral y cobertura válidos

### NAVD-FIX-001 — Directorio vacío

Cero Markdown directos, sin lifecycle propio.

Expected: `ACCEPT/BELOW_THRESHOLD`; índice no requerido.

### NAVD-FIX-002 — Un artifact directo

`migrations/batch-001.md`, enlazado directamente por parent, sin lifecycle de colección.

Expected: `ACCEPT/BELOW_THRESHOLD`; README opcional.

### NAVD-FIX-003 — Dos artifacts con índice

`README.md`, `a.md`, `b.md`; el índice enlaza ambos y parent enlaza README.

Expected: `ACCEPT/COMPLIANT`.

### NAVD-FIX-004 — Colección de un artifact

Un solo evidence artifact, pero el directorio declara lifecycle/registro propio y posee README
completo.

Expected: `ACCEPT/COMPLIANT`; el lifecycle activa el requisito aunque el conteo sea uno.

### NAVD-FIX-005 — Assets sin colección

Un Markdown y varios assets binarios, sin lifecycle propio.

Expected: `ACCEPT/BELOW_THRESHOLD`; los assets no activan umbral.

### NAVD-FIX-006 — Asset collection

Artifacts no Markdown con lifecycle/evidence propio, README con inventario y parent link.

Expected: `ACCEPT/COMPLIANT`.

### NAVD-FIX-007 — Hijo enlazado dos veces

`a.md` aparece en tabla temática e histórico.

Expected: `ACCEPT`; `linkedChildren=1`, sin duplicar cobertura.

### NAVD-FIX-008 — Exclusión vigente

Tres Markdown hijos; dos links y una exclusión con razón, owner y retiro vigentes.

Expected: `ACCEPT/COMPLIANT`; `linkedChildren=2`, `excludedChildren=1`.

### NAVD-FIX-009 — Subdirectorio anidado

Parent enlaza `child/README.md`; el child index enlaza sus hijos. Ambos niveles cumplen su umbral.

Expected: `ACCEPT`; no se exige que el parent liste nietos.

### NAVD-FIX-010 — Archivo histórico

Índice enlaza artifact `SUPERSEDED`, successor existente y sección histórica.

Expected: `ACCEPT`; conservar navegación no lo vuelve vigente.

## Índice y cobertura inválidos

### NAVD-FIX-011 — Dos artifacts sin README

Expected: `REJECT [NAVD001]`.

### NAVD-FIX-012 — Colección propia sin README

Un artifact con lifecycle de registro/evidence declarado, sin índice.

Expected: `REJECT [NAVD001]`.

### NAVD-FIX-013 — Hijo directo omitido

README existe pero no enlaza `b.md`.

Expected: `REJECT [NAVD002]`.

### NAVD-FIX-014 — Sólo alcance indirecto

README enlaza `a.md`; `a.md` enlaza `b.md`, pero README no enlaza `b.md`.

Expected: `REJECT [NAVD002]`; reachability indirecta no satisface `DIRECT_CHILDREN`.

### NAVD-FIX-015 — Nieto listado sin índice hijo

Parent lista archivos internos de `child/`, cuyo directorio requiere README pero no lo posee.

Expected: `REJECT [NAVD001]` para child; listar nietos no sustituye el índice.

### NAVD-FIX-016 — Link roto

README enlaza un hijo inexistente.

Expected: `REJECT [NAVD003]` y subcódigo `NAVL001`; no suma cobertura.

### NAVD-FIX-017 — Casing incorrecto

Existe `Report.md`; índice enlaza `report.md`.

Expected: `REJECT [NAVD003]` y subcódigo `NAVL003`.

### NAVD-FIX-018 — Destino fuera de scope

El label de un hijo enlaza otro archivo fuera de la colección.

Expected: `REJECT [NAVD002, NAVD003]`.

### NAVD-FIX-019 — Parent link ausente

Índice/hijos son internamente completos, pero parent no enlaza la colección.

Expected: `REJECT [NAVD004]`; los hijos pueden ser huérfanos en el grafo global.

### NAVD-FIX-020 — Parent apunta a directorio

Parent enlaza `reviews/` en vez de `reviews/README.md`.

Expected: `REJECT [NAVD004]` y subcódigo `NAVL005`.

## Exclusiones, metadata y lifecycle

### NAVD-FIX-021 — Exclusión incompleta

Falta razón, owner o condición de retiro.

Expected: `REJECT [NAVD005]`.

### NAVD-FIX-022 — Exclusión vencida

Expected: `REJECT [NAVD005]`; el artifact vuelve a requerir link.

### NAVD-FIX-023 — Ignore por nombre

Artifact `generated.md` o `temp.md` se omite sin clasificación/versioned exclusion.

Expected: `REJECT [NAVD005]`.

### NAVD-FIX-024 — Metadata lógica inconsistente

Falta scope/role/status, coverage mode no es `DIRECT_CHILDREN` o parent declarado no coincide.

Expected: `REJECT [NAVD006]`.

### NAVD-FIX-025 — Superseded sin successor

Artifact sale del índice principal y no aparece en histórico ni posee successor.

Expected: `REJECT [NAVD007]`.

### NAVD-FIX-026 — Índice retirado automáticamente

La colección baja de dos artifacts a uno y elimina README sin revisar consumers/historia.

Expected: `REJECT [NAVD007]`.

## Transiciones y ratchet

### NAVD-FIX-027 — Primer → segundo artifact atómico

El mismo cambio agrega segundo artifact, README completo, links de ambos hijos y parent link.

Expected: `ACCEPT/COMPLIANT`; cero ventana intermedia.

### NAVD-FIX-028 — Segundo artifact sin índice en el cambio

Expected: `REJECT [NAVD001, NAVD008]`; baseline cero no admite crecimiento.

### NAVD-FIX-029 — Nuevo hijo no enlazado

Colección previamente conforme agrega artifact sin actualizar README.

Expected: `REJECT [NAVD002, NAVD008]`.

### NAVD-FIX-030 — Parent link retirado

Se elimina parent link sin successor/manifest.

Expected: `REJECT [NAVD004, NAVD008]`.

### NAVD-FIX-031 — Scope/umbral cambia

Configuración cambia umbral de 2 a 3 o excluye un subtree sin nueva revisión/baseline.

Expected: `REJECT [NAVD008]`.

### NAVD-FIX-032 — Orden de filesystem variable

Mismo árbol enumerado en órdenes distintos.

Expected: reports byte-idénticos, directorios/children/findings ordenados; de lo contrario
`REJECT [NAVD008]`.

### NAVD-FIX-033 — Movimiento atómico

Colección cambia de path; parent, child index, consumers y successor histórico se actualizan juntos.

Expected: `ACCEPT`; identidad/lifecycle preservados y cero huérfanos.

### NAVD-FIX-034 — Movimiento parcial

Se mueve directorio pero quedan parent/consumer links al path anterior.

Expected: `REJECT [NAVD003, NAVD004, NAVD008]`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| umbral/colecciones | 001–006, 011–012 |
| cobertura/nesting | 003, 007–009, 013–020 |
| exclusiones/metadata | 008, 021–024 |
| lifecycle/retiro | 010, 025–026, 033–034 |
| transiciones/ratchet | 027–034 |
| determinismo | 032 |

Todos los códigos `NAVD001`–`NAVD008` poseen al menos un caso negativo.

## Criterios de salida

- [x] Casos positivos, negativos, transición y determinismo especificados.
- [x] Umbral, nesting, cobertura, parent links y exclusions cubiertos.
- [x] Ocho códigos cubiertos.
- [ ] Materializar árboles/expected reports.
- [ ] Aprobar contrato y catálogo mediante DOC-REV.
- [ ] Implementar gate después de aprobación.

Los últimos tres checks permanecen abiertos.
