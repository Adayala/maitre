# Contrato de review targets y blockers — SPEC-225

## Propósito

Este contrato define el próximo outcome perseguido por una spec y los impedimentos que evitan
alcanzarlo. Complementa `lifecycle-readiness-contract.md`; no reemplaza estado ni readiness.

## Review target

Valores canónicos iniciales:

| Valor | Significado |
| --- | --- |
| `READY_FOR_I0_REVIEW` | ingresar a revisión del incremento I0 |
| `READY_FOR_IMPLEMENTATION` | obtener aprobación del contrato para implementar |
| `VERIFIED` | demostrar conformidad de una implementación identificada |
| `DEPRECATION_REVIEW` | aprobar ventana, successor y retiro |
| `UNASSESSED` | el próximo outcome todavía no fue decidido |

El target es obligatorio para `PROPOSED_FOR_REVIEW`, `READY_FOR_I0_REVIEW` y `BLOCKED`. Durante la
migración, su ausencia equivale a deuda `UNASSESSED`, pero una spec nueva debe serializarlo.

El target no afirma que el outcome ya se alcanzó. Por ejemplo, `Review target:
READY_FOR_IMPLEMENTATION` junto con `Readiness: BLOCKED` significa que ese gate es el objetivo y
todavía no puede evaluarse o aprobarse.

## Blocker

Cada blocker debe ser una unidad resoluble:

```yaml
blockerId: <finding | ADR | spike | OWN-NNN | local provisional ID>
summary: <impedimento concreto>
blocksTarget: <Review target>
owner: <asignación ACCEPTED o UNASSIGNED>
resolutionEvidence: <tipo/referencia esperada>
status: OPEN | IN_REVIEW | RESOLVED | ACCEPTED_EXCEPTION
expiresAt: <obligatorio para excepción>
```

El README puede presentar una lista compacta, pero cada entrada debe poder resolverse contra un
registro enlazado.

## Reglas

1. `Readiness: BLOCKED` exige al menos un blocker `OPEN` o `IN_REVIEW`.
2. Un blocker activo declara exactamente qué target impide.
3. “Revisar”, “resolver TODOs” o “asignar responsables” sin scope/evidencia no basta para cerrar.
4. Falta de owner puede usar un `OWN-NNN` o finding local; no se inventa assignee.
5. Resolver un blocker requiere evidencia y reviewer; editar su texto no lo resuelve.
6. Eliminar el último blocker dispara reevaluación, no promoción automática.
7. `ACCEPTED_EXCEPTION` requiere owner del riesgo, mitigación y vencimiento.
8. Un blocker informativo que no impide el target se reclasifica como deuda/finding.

## Estado actual

- 19 de 90 README versionados declaran `Review target`.
- 71 no lo declaran y se consideran target `UNASSESSED` durante migración.
- 47 README declaran `Blockers`.
- 40 de esos blockers usan dos fórmulas genéricas: 19 “Asignar owner y reviewer” y 21 “Revisar
  contrato y asignar prioridad/ownership”.
- Los otros 7 identifican ADRs, spikes o gates concretos, aunque todavía deben enlazar evidencia y
  ownership.

Estos conteos son inventario, no resolución.

## Migración segura

1. Definir target por bloque con owner de producto/dominio.
2. Convertir cada impedimento material en blocker trazable.
3. Separar deuda informativa de blockers.
4. Enlazar assignments, findings, ADRs, spikes o gates.
5. Revisar evidencia y actualizar status.
6. Reevaluar readiness sin promover estado automáticamente.

## Criterios de salida

- [ ] Los 90 README versionados declaran target canónico o `UNASSESSED`.
- [ ] Toda spec `BLOCKED` tiene blocker trazable contra ese target.
- [ ] Cero blockers genéricos sin scope ni evidencia esperada.
- [ ] Excepciones poseen owner, mitigación y vencimiento.

Los criterios permanecen abiertos.
