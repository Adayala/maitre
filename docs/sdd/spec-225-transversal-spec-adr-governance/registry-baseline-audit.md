# Auditoría inicial del registro — SPEC-225

Fotografía manual reproducible previa a implementar `npm run sdd:validate`.

## 1. Alcance y resultado

Auditoría local sobre `docs/sdd/spec-*/README.md`:

| Control | Resultado |
| --- | --- |
| Directorios `spec-*` | 226 |
| Directorios con patrón `spec-NNN-slug` | 226 |
| Directorios legacy sin número | 0 |
| README sin `ID`, `Tipo`, `Dominio` o `Prioridad` parseable | 157 |
| README sin `Estado` parseable | 203 |
| README sin `Owner` | 224 |
| README sin `Reviewer` | 225 |
| README sin `Readiness` | 203 |

La ausencia de metadata básica se concentra en SPEC-049–205. Esos 157 README comienzan
con títulos placeholder como `# spec-049-entity-visit` y no poseen la tabla canónica.

Las 23 specs que ya declaran `Estado` usan `DRAFT` después de la normalización inicial.
Eso confirma sintaxis canónica en el subset, pero no implica readiness ni aprobación.

## 2. Findings de baseline

| Baseline | Rango/artefacto | Hallazgo esperado | Remediación |
| --- | --- | --- | --- |
| `BASE-SDD003-01` | SPEC-049–205 | metadata mínima ausente | migrar por dominio/lote |
| `BASE-SDD003-02` | repositorio salvo excepciones normalizadas | owner/reviewer ausentes | registrar rol o `UNASSIGNED` |
| `BASE-SDD003-03` | specs sin estado/readiness | lifecycle no declarado | agregar `DRAFT` + readiness real |
| `BASE-SDD008-01` | `INDEX.md` | slugs históricos sin `SPEC-NNN` | regenerar después de metadata mínima |
| `BASE-SDD008-02` | `START_HERE.md` | árbol/ejemplos históricos | reconciliar guía con estructura vigente |

Estos identificadores documentan categorías temporales. La línea base machine-readable
definitiva se crea con el validador y debe apuntar a un issue/owner por lote.

## 2.1 Frontera de control de versiones

Una segunda auditoría, posterior a los primeros lotes seguros, distinguió presencia en el
filesystem de trazabilidad Git:

| Control | Resultado |
| --- | --- |
| README numerados presentes | 226 |
| README raíz de spec versionados | 90 |
| README raíz de spec no rastreados | 136 |
| README versionados sin fila `ID` | 0 |
| README no rastreados con texto placeholder | 136 |
| Ruta legacy rastreada pero ausente | `docs/sdd/spec-entity-tenant/README.md` |

Los 136 README no rastreados no se incorporan mediante una migración mecánica: primero se
debe determinar su procedencia y confirmar si deben agregarse, reemplazarse o descartarse.
La ruta legacy tampoco se elimina desde esta auditoría, porque puede pertenecer a un cambio
concurrente. Hasta resolver ambos casos, los conteos del filesystem no equivalen al
catálogo publicable desde Git.

La evidencia y los criterios de aceptación para resolverla están definidos en el
[contrato de retiro de rutas legacy](legacy-path-retirement-contract.md).

## 2.2 Checkpoint del conjunto versionado

Después de normalizar los lotes seguros, los 90 README raíz versionados cumplen este
baseline estructural:

- `ID` coincide con el número del directorio;
- el título comienza con `[SPEC-NNN]`;
- no existen IDs duplicados dentro del conjunto;
- `Tipo` base coincide con el prefijo del slug;
- `Subtype` conserva especializaciones sin ampliar el enum base;
- `Estado`, `Readiness`, `Prioridad`, `Owner` y `Reviewer` están presentes;
- estados y prioridades asignadas usan valores canónicos;
- readiness bloqueada declara motivos, incluido ownership cuando está sin asignar.

Este checkpoint es una comprobación documental provisional, no evidencia generada por
`npm run sdd:validate`. Excluye deliberadamente los 136 README no rastreados y la ruta
legacy ausente; ambos continúan como blockers del catálogo completo.

## 3. Orden de remediación

1. Mantener estricto el subset I0 ya reconciliado.
2. Reconciliar la procedencia de README no rastreados y la ruta legacy ausente.
3. Normalizar SPEC-049–205 versionadas en lotes que respeten dominios y dependencias.
4. No completar descripciones, owners, prioridad o readiness por inferencia silenciosa.
5. Reejecutar auditoría tras cada lote y exigir que los conteos sólo bajen.
6. Regenerar catálogo e `INDEX.md` cuando todas las entradas tengan ID/título mínimo.
7. Reconciliar `START_HERE.md` y activar `SDD008` sin excepción histórica.

## 4. Lotes propuestos

| Lote | Specs | Tema |
| --- | --- | --- |
| A | 049–065 | Floor / visits / payments |
| B | 066–080 | Reservations |
| C | 081–110 | Ordering / kitchen |
| D | 111–136 | Shifts / cash |
| E | 137–166 | Fiscal / integrations |
| F | 167–190 | Analytics / inventory / delivery |
| G | 191–205 | Apps / cross-domain |

Los límites son unidades de migración documental, no prioridades de implementación.

## 5. Reproducción provisional

Hasta existir tooling versionado, la auditoría se reproduce enumerando directorios
`docs/sdd/spec-*` y comprobando en cada README las filas `ID`, `Tipo`, `Dominio`, `Estado`,
`Prioridad`, `Owner`, `Reviewer` y `Readiness`. El resultado durable será una fixture/test,
no un comando shell copiado a CI.
