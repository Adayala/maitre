# Contrato del registro — SPEC-225

## 1. Fuente de verdad

Cada `docs/sdd/spec-NNN-slug/README.md` es la fuente autoritativa de la metadata de esa
spec. No existe un segundo archivo manual con estado, owner o dependencias que pueda
contradecirla.

El tooling deriva de esos README:

- un catálogo machine-readable para consumidores automáticos;
- `docs/sdd/INDEX.md` como índice humano completo;
- secciones de navegación o métricas que se identifiquen explícitamente como generadas.

`START_HERE.md` sigue siendo una guía curada: sus links se validan, pero no pretende listar
las 226 specs.

## 2. Identidad de directorio

El directorio usa `spec-NNN-slug`, donde:

- `NNN` coincide con `ID: SPEC-NNN` del README;
- `slug` es kebab-case, estable y único;
- renombrar el slug conserva el ID y actualiza referencias en el mismo cambio;
- el título puede evolucionar sin modificar ID o slug salvo decisión explícita.

## 3. Campos

Campos obligatorios para specs nuevas y para el subset I0 normalizado:

| Campo | Tipo/regla |
| --- | --- |
| `ID` | `SPEC-NNN`, único e igual al directorio |
| `Tipo` | valor no vacío del vocabulario versionado |
| `Dominio` | valor no vacío del vocabulario versionado |
| `Estado` | enum canónico de SPEC-225 |
| `Readiness` | enum separado de estado |
| `Prioridad` | `P0`–`P3` o regla de migración explícita |
| `Owner` | rol estable o `UNASSIGNED` |
| `Reviewer` | rol/lista estable o `UNASSIGNED` |
| `Depende de` | lista de IDs/ADRs o `N/A` |

Campos condicionales:

- `Blockers` cuando `Readiness = BLOCKED`;
- `Reemplaza`/`Reemplazada por` para lifecycle histórico;
- `Fase` o incremento de SPEC-222 cuando aplica;
- revisión/commit aprobado desde `READY_FOR_IMPLEMENTATION`;
- fecha de deprecación/retiro para `DEPRECATED`.

Los documentos históricos se incorporan con la línea base de
`validation-contract.md`; eso no habilita omitir campos en una spec nueva.

## 4. Readiness

Valores iniciales:

```text
NOT_ASSESSED | PROPOSED_FOR_REVIEW | READY_FOR_I0_REVIEW | BLOCKED
```

Readiness informa preparación y no autoriza implementación. Sólo el campo `Estado` con
`READY_FOR_IMPLEMENTATION`, después de las aprobaciones de SPEC-225, otorga esa señal.

Agregar o renombrar un valor exige modificar el schema, fixtures y documentación en el
mismo commit.

## 5. Catálogo generado

La implementación debe producir un archivo determinista, con versión de schema, ordenado
numéricamente por ID. Cada entrada contiene sólo datos parseados del README más la ruta
calculada; no acepta overrides manuales.

Requisitos:

- mismo checkout produce bytes idénticos;
- no incluye timestamps de generación;
- serialización y orden de arrays son estables;
- una metadata ambigua/duplicada aborta antes de escribir;
- CI compara la salida esperada sin modificar el worktree;
- cambios de schema son versionados y poseen migración/compatibilidad explícita.

## 6. Índice humano

`INDEX.md` debe enlazar directorios reales `spec-NNN-slug/` y mostrar como mínimo ID,
título, tipo, dominio, estado y readiness. Checkboxes de roadmap no representan estado de
lifecycle; si se conservan, se etiquetan como planificación y se derivan de un campo
distinto.

La primera regeneración reemplazará referencias a slugs históricos sin número. Hasta que
esa tarea se complete, `SDD008` debe reportar el drift conocido mediante la línea base, no
considerar al índice autoritativo.

## 7. Operaciones

- Crear: reservar el siguiente ID disponible, crear README y regenerar catálogo/índice.
- Editar metadata: cambiar sólo el README autoritativo y regenerar proyecciones.
- Renombrar: conservar ID, actualizar links y regenerar.
- Superseder: enlazar sucesora en ambos README y regenerar; nunca borrar historia.
- Verificar: ejecutar `npm run sdd:validate`; CI falla ante drift nuevo.
