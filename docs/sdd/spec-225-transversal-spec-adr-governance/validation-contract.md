# Contrato del validador — SPEC-225

Contrato ejecutable que debe implementar `npm run sdd:validate`. Este documento define
validación mecánica; no sustituye revisión semántica ni aprobación.

## 1. Alcance

El validador inspecciona, sin acceso a red:

- specs bajo `docs/sdd/spec-*`;
- ADRs bajo `docs/adr/ADR-*`;
- el registro machine-readable, `INDEX.md` y `START_HERE.md`;
- links relativos y dependencias entre artefactos del repositorio.

Las URLs externas se comprueban en un job programado no bloqueante. Una caída externa
no vuelve indeterminista el gate de pull request.

## 2. Salida y proceso

- Cada hallazgo incluye `severity`, `code`, ruta, línea cuando sea posible y mensaje.
- La salida se ordena por ruta, línea y código; no incluye timestamps ni valores aleatorios.
- `exit 0`: no hay errores nuevos ni regresiones contra la línea base.
- `exit 1`: existe al menos un error nuevo, una excepción creció o el registro no puede leerse.
- Warnings quedan visibles, pero no convierten errores en éxito.
- CI es read-only: no corrige archivos, no asigna owners y no cambia estados.

## 3. Códigos mínimos

| Código | Error |
| --- | --- |
| `SDD001` | ID duplicado, inválido o reutilizado |
| `SDD002` | slug/directorio duplicado o inconsistente |
| `SDD003` | metadata requerida ausente o estado no canónico |
| `SDD004` | archivo mínimo ausente, vacío o placeholder |
| `SDD005` | link relativo o referencia a spec inexistente |
| `SDD006` | dependencia, successor o ciclo inválido |
| `SDD007` | transición/readiness incompatible con blockers o evidencia |
| `SDD008` | drift entre registro, `INDEX.md` o `START_HERE.md` |
| `ADR001` | ID/status/metadata de ADR inválidos |
| `ADR002` | relación successor/spec ausente o inválida |

Los códigos son API estable para CI. Cambiar su significado requiere actualizar fixtures,
documentación y consumidores en el mismo commit.

## 4. Metadata y estados

La metadata se parsea desde la tabla del README hasta migrar a un formato estructurado
aprobado. Los nombres de campo admitidos y sus aliases se declaran en configuración
versionada, no quedan embebidos de manera implícita en el parser.

`Estado` admite sólo:

```text
PLANNED | DRAFT | IN_REVIEW | READY_FOR_IMPLEMENTATION |
IN_PROGRESS | VERIFIED | DEPRECATED | SUPERSEDED
```

`DONE` se tolera únicamente si figura en la línea base histórica. Readiness, fase y
blockers son campos separados y nunca amplían el enum de estados.

## 5. Adopción de deuda histórica

La primera auditoría produce un inventario revisable. Tras revisión humana, los hallazgos
preexistentes aceptados temporalmente se guardan en una línea base versionada con:

- código del hallazgo;
- ruta e identidad estable del artefacto;
- razón y issue de remediación;
- owner por rol, incluso si queda `UNASSIGNED`;
- fecha o condición de retiro.

La línea base sólo puede mantenerse o reducirse. Un hallazgo nuevo, un conteo mayor o una
excepción sin issue falla el gate. Mover/renombrar un archivo no debe ocultar deuda: la
identidad usa ID y código además de la ruta.

La adopción se activa en este orden:

1. auditar todo el repositorio y revisar falsos positivos;
2. normalizar y validar estrictamente el subset I0 de SPEC-222;
3. exigir cero hallazgos nuevos en todo cambio;
4. retirar excepciones por lotes hasta lograr validación global limpia.

No se agrega deuda nueva a la línea base para aprobar un PR.

## 6. Coherencia de lifecycle

El validador rechaza mecánicamente:

- `READY_FOR_IMPLEMENTATION` con owner requerido `UNASSIGNED`, blocker P0 o archivos mínimos faltantes;
- `VERIFIED` sin referencias de evidencia configuradas;
- `DEPRECATED` sin alternativa/fecha de retiro;
- `SUPERSEDED` sin sucesora existente;
- dependencies/successors con ciclos no permitidos;
- estado compuesto como `DRAFT — READY FOR I0 REVIEW`.

El tooling nunca infiere aprobación a partir de checkboxes ni promociones automáticas.

## 7. Fixtures obligatorias

La implementación incluye al menos una fixture válida y una inválida por código, más casos
de orden estable, ciclo, link relativo, estado compuesto, crecimiento/reducción de baseline
y ausencia de red. Los tests verifican stdout normalizado y exit code.

## 8. Integración

`npm run sdd:validate` forma parte de `ci/required` según SPEC-207 y SPEC-221. El job usa
runtime fijado por lockfile, permisos de sólo lectura y no recibe secretos. Cualquier modo
de auditoría adicional debe tener nombre explícito y no puede reemplazar el gate estricto.
