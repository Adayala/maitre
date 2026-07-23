# Contrato de planes, hitos y estimaciones — SPEC-225

## Propósito

`plan.md` expresa una secuencia para alcanzar outcomes de la spec. No autoriza implementación, no
duplica el roadmap de SPEC-222 y no convierte una lista ordenada en compromiso temporal.

## Identidad de hitos

Formato:

```text
SPEC-NNN-MS-MMM
```

- `NNN` coincide con la spec propietaria.
- `MMM` es secuencial de tres dígitos y no se reutiliza.
- Un hito describe un outcome verificable, no una actividad genérica.

Ejemplo:

```markdown
## SPEC-010-MS-001 — Contrato HTTP revisado
```

## Hito versus tarea

| Concepto | Semántica |
| --- | --- |
| Hito | outcome/gate observable que agrupa trabajo |
| Tarea | unidad ejecutable con owner y evidencia de cierre |
| Criterio | condición que demuestra comportamiento/conformidad |
| Fase de producto | incremento I0–I6 gobernado por SPEC-222 |
| Etapa de ejecución | orden local dentro del plan |

Un hito enlaza tareas y criterios. No se marca completo sólo porque todas las tareas tengan checkbox:
debe satisfacer su exit condition.

## Schema lógico

```yaml
id: SPEC-NNN-MS-MMM
title: <outcome>
status: NOT_STARTED | IN_PROGRESS | BLOCKED | ACHIEVED | CANCELLED
productIncrement: <SPEC-222 I0..I6 | N/A>
dependsOn: [<milestone/ADR/finding>]
taskRefs: [SPEC-NNN-TSK-MMM]
criteriaRefs: [SPEC-NNN-AC-MMM]
entryConditions: [<condiciones>]
exitConditions: [<condiciones observables>]
evidenceRefs: [<refs>]
```

## Secuencia

El orden documental no implica dependencia. `dependsOn` registra precedencia directa y debe ser
acíclico. Hitos paralelizables no se fuerzan a una cadena.

Una dependencia entre milestones no sustituye `Depende de` entre specs ni `dependsOn` entre tareas.

## Fases

“Fase” se reserva en metadata para el incremento/roadmap de producto. Dentro de `plan.md` se usa
“Etapa” para pasos locales, salvo que el encabezado enlace explícitamente una fase de SPEC-222.

Renombrar encabezados no cambia el incremento asignado. Un cambio de incremento exige decisión de
producto, revisión de prioridad y actualización del catálogo.

## Estimaciones

La ausencia de estimación se serializa `NOT_ESTIMATED`; no es cero.

Una estimación publicable registra:

```yaml
estimate:
  value: <rango>
  unit: HOURS | DAYS | SPRINTS
  scope: <tareas/hitos incluidos>
  assumptions: [<supuestos>]
  confidence: LOW | MEDIUM | HIGH
  estimatedBy: <asignación ACCEPTED>
  estimatedAt: <timestamp>
  validUntil: <fecha/gate/cambio de scope>
```

Reglas:

- preferir rangos, no precisión falsa;
- no derivar esfuerzo de prioridad, número de archivos o cantidad de criterios;
- cambios de scope/dependencias invalidan o revisan la estimación;
- una duración histórica sin supuestos se conserva como `LEGACY_UNVERIFIED`;
- estimar no compromete fecha ni capacidad.

## Estado y cierre

`ACHIEVED` requiere exit conditions, evidence refs y reviewer cuando el riesgo lo exija. Un hito
cancelado enlaza decisión y explica impacto.

Plan completo no implica spec `VERIFIED`; sólo demuestra que los outcomes planificados fueron
alcanzados según sus evidencias.

## Línea base

- 226 archivos `plan.md`.
- 0 con IDs propios `SPEC-NNN-MS-MMM`.
- 59 encabezados que contienen “Fase” y requieren clasificación producto/etapa.
- 51 archivos con menciones temporales detectables que requieren validar scope, supuestos,
  confianza y vigencia.

## Migración

1. Identificar outcomes y separar actividades.
2. Asignar IDs a hitos.
3. Convertir “Fase” local en “Etapa” o enlazar SPEC-222.
4. Mapear tareas, criterios y dependencias.
5. Clasificar estimaciones como verificables, vencidas o `LEGACY_UNVERIFIED`.
6. Mantener todos los hitos no evidenciados sin marcar.
7. Revisar el mapping por bloque.

## Criterios de salida

- [ ] Los 226 planes usan hitos identificables.
- [ ] Cero ambigüedad entre fase de producto y etapa local.
- [ ] Estimaciones publicadas poseen scope, supuestos, confianza y vigencia.
- [ ] Hitos alcanzados enlazan evidencia.

Los checks permanecen abiertos.
