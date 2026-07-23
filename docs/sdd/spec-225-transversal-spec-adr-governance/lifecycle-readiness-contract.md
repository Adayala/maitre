# Contrato de lifecycle, readiness y blockers — SPEC-225

## Dimensiones

| Campo | Pregunta que responde | Valores |
| --- | --- | --- |
| `Estado` | ¿en qué etapa real está el contrato/trabajo? | `PLANNED`, `DRAFT`, `IN_REVIEW`, `READY_FOR_IMPLEMENTATION`, `IN_PROGRESS`, `VERIFIED`, `DEPRECATED`, `SUPERSEDED` |
| `Readiness` | ¿puede avanzar al próximo gate declarado? | `NOT_ASSESSED`, `PROPOSED_FOR_REVIEW`, `READY_FOR_I0_REVIEW`, `BLOCKED` |
| `Review target` | ¿qué outcome se busca a continuación? | gate/lifecycle canónico |
| `Fase` | ¿en qué incremento o ventana se ubica? | `I0`–`I6`, MVP o fase aprobada |
| `Blockers` | ¿qué impedimentos concretos evitan avanzar? | lista trazable o ausencia |

Ningún campo sustituye a otro. En particular, `WALKING_SKELETON_I0` describe fase/alcance y no es
un valor de readiness.

Los valores, estructura y migración detallada de target/blockers se rigen por
`review-target-blocker-contract.md`.

## Estado

- `PLANNED`: existe intención registrada, pero el contrato todavía no fue elaborado.
- `DRAFT`: contrato en elaboración, sin aprobación.
- `IN_REVIEW`: revisión activa contra commit identificado.
- `READY_FOR_IMPLEMENTATION`: contrato aprobado para implementar; requiere owner, reviewers y cero
  blockers.
- `IN_PROGRESS`: existe implementación en curso. No prueba aprobación del contrato.
- `VERIFIED`: implementación identificada satisface criterios y gates con evidencia.
- `DEPRECATED`: continúa vigente durante una ventana de retiro.
- `SUPERSEDED`: otro contrato identificado lo reemplazó.

## Readiness

- `NOT_ASSESSED`: todavía no se evaluó preparación para el target.
- `PROPOSED_FOR_REVIEW`: existe propuesta completa pendiente de revisión.
- `READY_FOR_I0_REVIEW`: puede entrar a revisión I0; no autoriza implementación.
- `BLOCKED`: uno o más impedimentos concretos evitan alcanzar el target.

No existe promoción automática desde readiness hacia estado.

## Blockers

`Blockers` es obligatorio y no vacío cuando `Readiness = BLOCKED`. Cada entrada debe identificar,
cuando exista, finding, ADR, spike, owner, evidencia o decisión pendiente.

Si una spec declara un impedimento material que evita su target, su readiness debe ser `BLOCKED`.
No se conserva `NOT_ASSESSED` o `READY_*` junto con blockers activos para suavizar el estado.

Una nota informativa o deuda que no impide el target se registra como finding/deuda, no como
`Blockers`.

Resolver el último blocker no promueve readiness: vuelve a evaluarse el target y se registra la
decisión.

## Implementación adelantada

`IN_PROGRESS` sin aprobación previa conserva el hecho histórico y requiere:

- `Readiness: BLOCKED`;
- target de revisión retroactiva;
- blocker con finding y owner/reviewer pendientes;
- referencia a implementación/commit observados;
- outcome posterior `COMPATIBLE`, `REMEDIATION_REQUIRED` o `PREMISE_REJECTED`.

No se revierte a `DRAFT` para ocultar código existente ni se promueve por la sola existencia de
tests.

## Transiciones

Cada transición registra estado/readiness anterior, nuevo valor, razón, actor autorizado, reviewed
commit y evidencia. Retrocesos son válidos, pero conservan historia y decisión.

Requisitos mínimos:

- `IN_REVIEW`: owner y reviewer asignados, commit objetivo y checklist.
- `READY_FOR_IMPLEMENTATION`: review `APPROVE` sobre el mismo commit y cero blockers.
- `IN_PROGRESS`: implementación/issue identificable.
- `VERIFIED`: manifest de evidencia, criterios y gates `PASS`.
- `DEPRECATED`/`SUPERSEDED`: successor, ventana y política de compatibilidad.

## Inventario versionado actual

| Estado | Readiness | Cantidad | Evaluación |
| --- | --- | ---: | --- |
| `DRAFT` | `BLOCKED` | 21 | combinación canónica; revisar calidad de blockers |
| `DRAFT` | `NOT_ASSESSED` | 21 | válida sólo sin blockers activos |
| `PLANNED` | `NOT_ASSESSED` | 12 | válida sólo sin blockers activos |
| `IN_PROGRESS` | `WALKING_SKELETON_I0` | 36 | no canónica; requiere revisión retroactiva |

Además, 26 README no bloqueados declaran `Blockers`: 21 corresponden a specs con prioridad/ownership
pendiente y 5 a contratos I0 adelantados. Deben clasificarse y migrarse mediante revisión, no con un
reemplazo textual global.

## Criterios de salida

- [ ] Cero valores de fase dentro de `Readiness`.
- [ ] Cero blockers activos con readiness distinta de `BLOCKED`.
- [ ] Las 36 specs adelantadas poseen revisión retroactiva.
- [ ] Todo `READY_FOR_IMPLEMENTATION` enlaza aprobación del commit exacto.
- [ ] Todo `VERIFIED` enlaza manifest y gates.

Los criterios permanecen abiertos.
