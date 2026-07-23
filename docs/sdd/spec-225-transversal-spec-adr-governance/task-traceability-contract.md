# Contrato de identidad y trazabilidad de tareas — SPEC-225

## Propósito

Las tareas convierten una spec aprobada en trabajo planificable, pero no sustituyen criterios de
aceptación ni evidencia. Cada tarea necesita identidad estable para relacionar scope, dependencias,
criterios, cambios y cierre.

Las tareas se agrupan en hitos `SPEC-NNN-MS-MMM` según `plan-milestone-contract.md`.

## Identidad

Formato canónico:

```text
SPEC-NNN-TSK-MMM
```

- `NNN` coincide con la spec propietaria.
- `MMM` es secuencial de tres dígitos y no se reutiliza.
- La tarea vive en `tasks.md` de la spec propietaria.
- Una tarea transversal pertenece a la spec transversal que gobierna el outcome.

Ejemplo:

```markdown
- [ ] **SPEC-010-TSK-001** `[IMPLEMENTATION]` Implementar create-branch tenant-safe.
```

## Tipos

| Tipo | Outcome |
| --- | --- |
| `DOCUMENTATION` | contrato, ADR o metadata reconciliados |
| `DECISION` | decisión humana registrada |
| `IMPLEMENTATION` | comportamiento/código/configuración modificados |
| `VERIFICATION` | criterio evaluado con evidencia |
| `MIGRATION` | datos, schema o documentos trasladados con reconciliación |
| `OPERATIONS` | ambiente, provider, secreto, backup o runbook preparado |
| `REMEDIATION` | finding identificado resuelto o mitigado |

Una tarea compuesta por outcomes de tipos distintos se divide.

## Schema lógico

```yaml
id: SPEC-NNN-TSK-MMM
type: DOCUMENTATION | DECISION | IMPLEMENTATION | VERIFICATION | MIGRATION | OPERATIONS | REMEDIATION
title: <acción y outcome>
status: TODO | IN_PROGRESS | BLOCKED | DONE | CANCELLED
criteriaRefs: [SPEC-NNN-AC-MMM]
dependsOn: [SPEC-NNN-TSK-MMM | ADR-NNN | finding]
owner: <asignación ACCEPTED o UNASSIGNED>
artifacts: [<paths/refs esperados>]
completionEvidence: [<commit/artifact/review refs>]
```

`criteriaRefs` puede ser vacío para trabajo puramente habilitador, pero debe explicar el outcome que
desbloquea.

## Estados

- `TODO`: trabajo definido, no iniciado.
- `IN_PROGRESS`: ejecución observada con owner y referencia.
- `BLOCKED`: impedimento trazable impide avanzar.
- `DONE`: artifacts y evidencia de cierre revisados.
- `CANCELLED`: ya no se realizará por decisión enlazada.

El checkbox Markdown es una proyección visual: `[ ]` representa un estado no finalizado y `[x]`
representa `DONE` o `CANCELLED` sólo cuando el texto/metadata distingue cuál.

## Reglas de cierre

Marcar una tarea `DONE` exige:

1. outcome y artifacts presentes;
2. commit o referencia inmutable;
3. criterios relacionados evaluados cuando corresponda;
4. gates aplicables registrados;
5. reviewer requerido por riesgo;
6. blockers resueltos o excepción vigente.

Completar una tarea no marca automáticamente un criterio `PASS`, una spec `VERIFIED` ni un finding
`RESOLVED`.

## Dependencias

`dependsOn` expresa precedencia de trabajo, no reemplaza `Depende de` entre specs. Debe ser acíclico
dentro del plan ejecutable. Una tarea bloqueada por decisión externa referencia ADR/finding en lugar
de fabricar otra tarea como completada.

## Cambios y cancelación

Editar redacción conserva ID sólo si mantiene outcome y artifacts. Un cambio semántico crea nueva
tarea y cancela/supersede la anterior con decision ref.

No se eliminan tareas cerradas para “limpiar” la lista; se preservan o archivan con historia.

## Migración

Línea base:

- 226 archivos `tasks.md`;
- 800 items checkbox;
- 0 archivos con IDs propios `SPEC-NNN-TSK-MMM`;
- 25 items marcados en 10 archivos.

Migración por bloque:

1. clasificar items por tipo;
2. dividir tareas compuestas y eliminar duplicados sólo mediante mapping;
3. asignar IDs estables;
4. enlazar criterios/dependencias;
5. mantener todos los checks actuales sin reinterpretarlos;
6. auditar por separado los 25 checks marcados y registrar evidencia o estado `UNVERIFIED_DONE`;
7. revisar y publicar mapping contra commit.

`UNVERIFIED_DONE` es una clasificación de migración, no un estado final canónico.

## Criterios de salida

- [ ] Los 226 `tasks.md` usan IDs estables.
- [ ] Las 800 entradas están clasificadas o reconciliadas.
- [ ] Los 25 checks históricos poseen evidencia o finding.
- [ ] Cada tarea implementable enlaza criterios o outcome habilitador.
- [ ] Cero ciclos de tareas.

Los checks permanecen abiertos.
