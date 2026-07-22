# Propuesta de normalización lifecycle/readiness

Documento de decisión para ORG-REV-002/003, ID-REV-003 y PLAT-REV-001/003. No modifica README:
define la migración a revisar para conservar verdad histórica sin confundir implementación con
aprobación.

## Inventario del checkout

| Forma | Campo/valor | Cantidad |
| --- | --- | ---: |
| Metadata tabular | `Estado: DRAFT` | 42 |
| Metadata tabular | `Estado: PLANNED` | 30 |
| Metadata tabular | `Estado: IN_PROGRESS` | 18 |
| Metadata tabular | `Readiness: NOT_ASSESSED` | 51 |
| Metadata tabular | `Readiness: BLOCKED` | 21 |
| Metadata tabular | `Readiness: WALKING_SKELETON_I0` | 18 |
| Placeholder legado | `Status: DRAFT` | 136 |

Total: 226 specs. Los 136 placeholders no poseen metadata autoritativa completa y no pueden
considerarse listos sólo por declarar `DRAFT`.

## Separación normativa

### Estado

Describe el lifecycle real del contrato/trabajo:

```text
PLANNED | DRAFT | IN_REVIEW | READY_FOR_IMPLEMENTATION |
IN_PROGRESS | VERIFIED | DEPRECATED | SUPERSEDED
```

### Readiness

Describe preparación/evaluación y blockers, sin autorizar implementación:

```text
NOT_ASSESSED | PROPOSED_FOR_REVIEW | READY_FOR_I0_REVIEW | BLOCKED
```

`READY_FOR_I0_REVIEW` significa “puede entrar a revisión I0”, no
`READY_FOR_IMPLEMENTATION`. `WALKING_SKELETON_I0` es fase/target, no readiness.

## Política para implementación adelantada

No se revierte `IN_PROGRESS` a `DRAFT` automáticamente: existe código y ocultarlo degradaría la
trazabilidad. Tampoco se interpreta como aprobación.

Para las 18 specs afectadas:

```text
Estado: IN_PROGRESS
Readiness: BLOCKED
Review target: READY_FOR_I0_REVIEW
Blockers: Revisión retroactiva PLAT-REV-003; owner/reviewer; findings del dominio
Fase: I0 / walking skeleton
```

La revisión puede concluir:

- contrato/código compatibles: registrar evidencia actual y decisión de lifecycle;
- gaps corregibles: mantener `IN_PROGRESS/BLOCKED` hasta resolverlos;
- premisa incorrecta: volver contrato a `DRAFT` mediante decisión explícita, preservando código
  detrás de branch/flag o plan de reemplazo;
- implementación verificada: sólo después de criterios, gates, reviewer y evidencia del contrato
  de implementación; nunca por existencia de tests.

## Mapping de migración

| Entrada | Estado propuesto | Readiness propuesta | Regla |
| --- | --- | --- | --- |
| `Status: DRAFT` placeholder | `DRAFT` | `BLOCKED` | faltan type/priority/owner/reviewer/dependencies |
| `PLANNED + NOT_ASSESSED` | sin cambio | sin cambio o `BLOCKED` | BLOCKED si falta campo/gate requerido |
| `DRAFT + NOT_ASSESSED` | sin cambio | sin cambio | sólo si metadata mínima completa |
| `IN_PROGRESS + WALKING_SKELETON_I0` | `IN_PROGRESS` | `BLOCKED` | preservar hecho y exigir revisión retroactiva |
| `DRAFT + BLOCKED` | sin cambio | sin cambio | blocker concreto obligatorio |
| estado compuesto/texto libre | valor canónico revisado | valor canónico revisado | no inferir autorización |

No existe mapping automático hacia `READY_FOR_IMPLEMENTATION` o `VERIFIED`.

## Campos auxiliares

- `Fase`: `I0`, `I1`, MVP u otra fase; nunca sustituye estado/readiness.
- `Review target`: outcome siguiente esperado; no afirma que ya se alcanzó.
- `Blockers`: requerido para `BLOCKED`, con finding/ADR/spike/owner concreto.
- `Implementation evidence`: referencia al manifest de SPEC-225 cuando corresponda.
- `Review`: reviewer, outcome, reviewed commit y fecha desde READY_FOR_IMPLEMENTATION.

## Invariantes del validador

1. `IN_PROGRESS` requiere referencia a aprobación previa o blocker de revisión retroactiva.
2. `READY_FOR_IMPLEMENTATION` requiere owner/reviewer, cero blockers y review `APPROVE` sobre el
   mismo commit de spec.
3. `VERIFIED` requiere implementación identificada, criterios y gates PASS.
4. `BLOCKED` requiere blockers no vacíos con IDs cuando existan.
5. Fase/target no aceptan valores de lifecycle/readiness y viceversa.
6. Placeholder legado no puede superar `DRAFT/BLOCKED` durante migración.
7. Un bot valida/proyecta, pero no promueve estados.
8. Cambiar a un estado anterior conserva history/decision reference.

## Fixtures

- `IN_PROGRESS/BLOCKED` con revisión retroactiva válida.
- `IN_PROGRESS/WALKING_SKELETON_I0` rechazado.
- `READY_FOR_IMPLEMENTATION` sin reviewer o con blocker rechazado.
- `VERIFIED` sin evidence manifest rechazado.
- placeholder `Status: DRAFT` reportado como migración pendiente.
- `READY_FOR_I0_REVIEW` aceptado sólo como readiness/target.
- transición backward con decision reference y sin ella.

## Migración segura

1. Aprobar enums/mapping y owner de SPEC-225.
2. Actualizar schema, fixtures y baseline antes de README masivos.
3. Migrar primero las 18 specs implementadas y revisar su evidencia.
4. Migrar los 136 placeholders por dominio, asignando metadata real; no usar defaults ficticios.
5. Regenerar catálogo/índice y comparar conteos deterministas.
6. Ejecutar revisión humana por bloque y sólo entonces considerar nuevos estados.
