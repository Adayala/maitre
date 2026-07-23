# Contrato de asignación de ownership y revisión — SPEC-225

## Propósito

Este contrato define cuándo un owner o reviewer deja de ser `UNASSIGNED`, qué autoridad recibe y
qué evidencia conserva la asignación. La matriz
[ownership-review-matrix.md](reviews/ownership-review-matrix.md) define los roles requeridos por
bloque; este documento define su lifecycle.

La suficiencia de capabilities, risk tiers, grupos, delegación y escalamiento se rige por el
[contrato de autoridad](authority-capability-delegation-contract.md).

## Principios

- Se asigna una identidad verificable a un rol explícito y a un scope limitado.
- La mención informal, autoría de un archivo o acceso a un proveedor no constituye aceptación.
- Owner y reviewer son responsabilidades distintas aunque, en cambios no críticos, una persona
  pueda desempeñar más de un rol.
- Un rol no concede permisos operativos, credenciales ni autoridad fuera del scope registrado.
- `UNASSIGNED` es el estado seguro hasta contar con aceptación completa.

## Registro autoritativo

Cada asignación debe registrar:

```yaml
assignmentId: OWN-NNN
scope: SPEC-NNN | DOMAIN:<name> | ADR-NNN
role: <rol de la matriz>
assignee: <identidad verificable>
status: PROPOSED | ACCEPTED | SUSPENDED | EXPIRED | REVOKED
acceptedAt: <timestamp UTC o null>
effectiveFrom: <commit/ref o null>
backup: <identidad opcional>
expiresAt: <timestamp UTC opcional>
conflicts: [<declaraciones>]
evidence: <referencia a aceptación>
```

La metadata del README puede mostrar el rol o assignee efectivo, pero no reemplaza el
[registro de ownership y autoridad](ownership-authority-registry-contract.md) ni su historia.

## Transiciones

| Desde | A | Condición |
| --- | --- | --- |
| inexistente | `PROPOSED` | scope, rol y candidato identificados |
| `PROPOSED` | `ACCEPTED` | aceptación explícita, conflictos declarados y `effectiveFrom` fijado |
| `ACCEPTED` | `SUSPENDED` | ausencia temporal o conflicto impide ejercer el rol |
| `ACCEPTED` | `EXPIRED` | vence `expiresAt` sin renovación |
| `ACCEPTED`/`SUSPENDED` | `REVOKED` | retiro u offboarding registrado |
| `SUSPENDED` | `ACCEPTED` | impedimento resuelto y aceptación reconfirmada |

Sólo `ACCEPTED` y vigente satisface el requisito de ownership/review. Los demás estados se
serializan como `UNASSIGNED` en readiness o mantienen un blocker equivalente.

## Conflictos y segregación

El assignee declara conflictos materiales. Para aislamiento multi-tenant, seguridad, dinero,
fiscalidad, relaciones laborales, privacidad y automatización:

- el autor no puede ser el único reviewer;
- quien custodia credenciales no obtiene aprobación normativa automática;
- una excepción requiere owner del riesgo, reviewer competente, mitigación y vencimiento;
- la falta de reviewer independiente mantiene `BLOCKED`.

Si el equipo no puede segregar personas, debe registrar la limitación y obtener revisión externa o
mantener el cambio bloqueado; no se degrada silenciosamente la matriz.

## Disponibilidad, reemplazo y offboarding

- Los scopes críticos definen backup o una ruta de escalamiento.
- Suspensión, expiración o revocación bloquean nuevas aprobaciones desde su efectividad.
- Las aprobaciones históricas sobre commits exactos se conservan.
- Un reemplazo crea otra asignación; no reescribe la anterior.
- El offboarding separa revocación de accesos de la transferencia de responsabilidad documental.

## Reconciliación con README

Un README puede abandonar `UNASSIGNED` sólo cuando:

1. existe asignación `ACCEPTED` y vigente para su scope;
2. el rol satisface la matriz del bloque;
3. el assignee aceptó conflictos y alcance;
4. la modificación enlaza la evidencia y el commit efectivo;
5. los reviewers requeridos se registran de forma independiente cuando corresponda.

Asignar owner no promueve automáticamente `Estado` ni `Readiness`.

## Estado actual

En los 90 README raíz versionados, 89 owners y 90 reviewers permanecen `UNASSIGNED`. La única
identidad nominal existente no se replica a otras specs ni se considera aceptación de un dominio
completo. Este contrato no realiza asignaciones.

## Criterios de salida

- [ ] Owners de SPEC-207, SPEC-225 y SPEC-226 aceptados.
- [ ] Reviewers mínimos de esas specs aceptados.
- [ ] Cada bloque posee owner efectivo o blocker explícito.
- [ ] Scopes críticos poseen backup o escalamiento.
- [ ] Conflictos, expiración y offboarding son verificables.

Los checks requieren evidencia externa y permanecen abiertos.
