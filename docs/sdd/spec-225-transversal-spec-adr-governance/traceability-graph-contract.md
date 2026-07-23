# Contrato del grafo de trazabilidad — SPEC-225

## Propósito

El grafo conecta intención, contrato, diseño, verificación, trabajo y evidencia. Permite detectar
objetivos sin requisitos, obligaciones sin criterios, tareas sin justificación y evidencia sin
commit/contrato.

## Nodos

| Tipo | ID | Autoridad |
| --- | --- | --- |
| Objetivo | `SPEC-NNN-OBJ-MMM` | `objective.md` |
| Requisito | `SPEC-NNN-REQ-MMM` | `specification.md` |
| Regla | `SPEC-NNN-RULE-MMM` | `rules.md` |
| Boundary | `SPEC-NNN-BND-MMM` | `structure.md` |
| Criterio | `SPEC-NNN-AC-MMM` | `verification.md` |
| Hito | `SPEC-NNN-MS-MMM` | `plan.md` |
| Tarea | `SPEC-NNN-TSK-MMM` | `tasks.md` |
| Decisión | `ADR-NNN` | registro ADR |
| Finding | ID de registro de findings | registro correspondiente |
| Evidencia | ID/ref de manifest/artifact | evidence manifest |

Cada nodo tiene una única definición autoritativa. Las demás apariciones son referencias.

## Edges

| Edge | Semántica |
| --- | --- |
| `REALIZES` | requisito/regla realiza un objetivo |
| `CONSTRAINS` | regla/ADR restringe requisito o boundary |
| `ALLOCATED_TO` | requisito se asigna a boundary |
| `VERIFIED_BY` | requisito/regla se demuestra mediante criterio |
| `PLANNED_IN` | criterio/outcome se incluye en hito |
| `DELIVERED_BY` | hito/criterio se ejecuta mediante tarea |
| `EVIDENCED_BY` | criterio/tarea/gate enlaza evidencia |
| `BLOCKED_BY` | nodo no puede avanzar por finding/ADR/asignación |
| `DEPENDS_ON` | precedencia directa entre nodos del mismo nivel permitido |
| `SUPERSEDED_BY` | lifecycle hacia successor |

Los nombres son representación lógica; Markdown puede usar campos `*Refs` equivalentes.

## Cardinalidades mínimas

- Todo objetivo activo tiene al menos un requisito/regla `REALIZES`, salvo objetivo exploratorio que
  enlaza spike/decisión y outcome esperado.
- Todo requisito `MUST/MUST_NOT` tiene al menos un criterio `VERIFIED_BY`.
- Toda regla activa tiene criterio o justificación de verificación estática.
- Todo boundary `SOLUTION_BOUNDARIES_DEFINED` realiza al menos un requisito y declara autoridad.
- Todo criterio requerido se planifica en hito o se marca backlog con decisión.
- Todo hito activo contiene tareas y exit conditions.
- Toda tarea de implementación/verificación enlaza criterio; una tarea habilitadora explica el
  outcome desbloqueado.
- Todo `PASS`, `DONE`, `ACHIEVED` o `VERIFIED` enlaza evidencia.
- Todo nodo `SUPERSEDED` identifica uno o más successors válidos.

No se exige relación uno-a-uno.

## Edges cross-spec

Se permiten cuando una spec consume regla, boundary o criterio transversal. Deben indicar razón y
dirección. El nodo sigue siendo propiedad de su spec original.

Una referencia cross-spec no crea automáticamente `Depende de` entre specs; esa precedencia se
evalúa según `dependency-relation-contract.md`.

## Cobertura

Estados por nodo:

```text
UNMAPPED | PARTIAL | COMPLETE | WAIVED
```

- `UNMAPPED`: no se evaluaron edges requeridos.
- `PARTIAL`: existen edges, pero falta cobertura obligatoria.
- `COMPLETE`: cardinalidades y destinos válidos.
- `WAIVED`: excepción aprobada con owner, razón y vencimiento.

Cobertura se reporta por tipo y spec:

```yaml
nodeType: REQUIREMENT
total: <n>
complete: <n>
partial: <n>
unmapped: <n>
waived: <n>
```

No se promedian tipos para ocultar requisitos críticos sin cubrir.

## Integridad

1. Todo ID referenciado existe o está en baseline migratorio explícito.
2. El edge usa tipos permitidos y dirección válida.
3. No hay self-edge salvo una relación expresamente reflexiva (inicialmente ninguna).
4. `DEPENDS_ON` es acíclico dentro de su subgrafo.
5. Successors no forman ciclos y preservan historia.
6. Nodos retirados no reciben edges nuevos salvo auditoría histórica.
7. Evidence refs incluyen commit/hash/retention según su contrato.

## Cambios

Un cambio de requisito/regla recalcula downstream:

- criterios afectados;
- boundaries/consumidores;
- hitos/tareas abiertos;
- evidencia stale;
- prioridad/dependencias cuando cambia alcance.

No se marca todo stale por texto editorial: se usa clase de cambio contractual.

## Línea base

Los siete tipos `OBJ`, `REQ`, `RULE`, `BND`, `AC`, `MS` y `TSK` tienen contratos de identidad, pero
el checkout todavía contiene cero nodos canónicos reales. Por lo tanto:

- nodos canónicos: 0;
- edges canónicos: 0;
- cobertura: `UNMAPPED`;
- completitud no calculable hasta el primer lote migrado.

Esto no significa ausencia de intención o contenido; significa ausencia de identidad trazable.

## Migración

1. Migrar por spec en orden OBJ→REQ/RULE→BND→AC→MS/TSK.
2. Publicar mapping de texto legacy a IDs.
3. Crear edges dentro de la spec.
4. Resolver referencias cross-spec.
5. Vincular evidencia existente como posterior/histórica.
6. Calcular huérfanos y cardinalidades.
7. Revisar excepciones y publicar cobertura.

Cada conjunto se gobierna como lote mediante `document-migration-batch-contract.md`.

## Criterios de salida

- [ ] Cero nodos obligatorios huérfanos.
- [ ] Cero referencias a IDs inexistentes.
- [ ] MUST/MUST_NOT y reglas activas poseen verificación.
- [ ] Estados finales enlazan evidencia.
- [ ] Cobertura crítica se reporta sin promedios engañosos.

Los checks permanecen abiertos.
