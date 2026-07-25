# Especificación — SPEC-122 Workforce RBAC

Permisos: `workshift.read_own`, `plan`, `assign`; `time.clock`, `time.read_own`, `time.adjust.request`,
`time.adjust.approve`, `time.read_sensitive`, `time.export`; `labor_policy.manage/review`.

`employee`, `supervisor` y `payroll` no son roles locales: Employment + assignments de permisos
versionados determinan alcance. Datos de jornada/remuneración son sensibles. Requester y approver
de un ajuste deben ser distintos cuando la policy lo exige. Export requiere step-up y audit.

Permissions canónicas I0:

```text
workshift.read_own
workshift.plan
workshift.assign
time.clock
time.read_own
time.adjust.request
time.adjust.approve
time.read_sensitive
time.export
labor_policy.manage
labor_policy.review
```

La autorización combina Membership/credenciales de sistema con Employment y alcances laborales
aprobados. `workshift.read_own` y `time.read_own` operan sobre la propia relación laboral; lectura
sensible y export requieren alcances más fuertes, branch constraints y justificación/auditoría. Un
assignment de tipo `payroll` no implica permiso para modificar planificación si no se asignó
explícitamente.

## Cierre de matriz para `employments`

`Employment` no introduce un permiso canónico adicional en I0. Se considera parte del contexto
laboral sensible usado por shifts y time tracking.

Regla aprobada para I0:

- crear/editar relaciones laborales (`POST /v1/employments` y futuras mutaciones) requiere
  `workshift.plan`
- listar/consultar `employments` ajenos dentro del branch scope requiere `time.read_sensitive`
- consultar el propio `employment` como actor final queda autorizado sólo cuando la operación sea
  necesaria para resolver `time.read_own` o `workshift.read_own`; no se expone un permiso
  separado de lectura propia de `employment`

Racional:

- `employment` contiene elegibilidad de sucursales y vínculo laboral, por lo que no es un dato
  operacional neutro
- planificación y asignación dependen de la existencia/validez del `employment`, por lo que su alta
  cae del lado de `workshift.plan`
- la lectura supervisora de `employment` habilita inferencias sobre cobertura, dotación y
  elegibilidad laboral; por eso cae del lado de `time.read_sensitive`, no de `workshift.assign`

Mapeo I0 de endpoints:

- `POST /v1/employments` → `workshift.plan`
- `GET /v1/employments` → `time.read_sensitive`
- `GET /v1/employments/:id` → `time.read_sensitive` o acceso derivado de own-scope cuando aplique
- `GET /v1/branches/:branchId/employments` → `time.read_sensitive`

No aprobado en I0:

- crear un permiso nuevo tipo `employment.read`
- tratar `employee`, `supervisor` o `payroll` como roles implícitos con acceso automático a
  `employments`

## Política de `time.export`, step-up y auditoría

`time.export` representa una autorización más fuerte que `time.read_sensitive`. No habilita
mutaciones operativas; habilita iniciar o aprobar extracciones laborales para payroll, conciliación o
compliance.

Regla aprobada para I0:

- `time.read_sensitive` autoriza lectura sensible interactiva branch-scoped
- `time.export` autoriza export branch-scoped sólo bajo step-up vigente y con evidencia auditable
- poseer `time.export` no reemplaza branch constraints ni tenant isolation
- `time.export` no implica `workshift.plan`, `workshift.assign` ni `time.adjust.approve`

Controles mínimos requeridos para una operación de export:

- actor autenticado con sesión vigente al momento de iniciar el export
- step-up reciente y verificable para la sesión activa
- alcance explícito de tenant + branch + rango temporal
- motivo/justificación persistida junto al request
- generación de evidencia auditable con actor, scope, timestamps y correlación
- entrega asíncrona; no se aprueba export síncrono ilimitado en I0

Modelo de decisión:

- lectura sensible interactiva (`GET` branch-scoped, dashboards laborales, review) → `time.read_sensitive`
- export operativo/payroll (CSV, snapshot, extract) → `time.export` + step-up + audit
- ajustes sobre períodos exportados siguen siendo append-only según SPEC-117; el export no congela
  autorización futura, sólo el snapshot emitido

## Revocación y stale authorization

La autorización se evalúa por request, no por sesión lógica de trabajo.

Regla aprobada para I0:

- si una Membership se revoca, desactiva o sale del branch scope, el siguiente request debe perder acceso
- si el step-up expira, el actor puede conservar `time.read_sensitive` pero no `time.export`
- si la sesión expira o queda stale, cualquier operación sensible o de export debe fallar
- un snapshot/export ya emitido no se invalida retroactivamente, pero todo acceso posterior debe
  reautorizarse

## Frontera entre `labor_policy.*`, `payroll` y `time.export`

`labor_policy.review` y `labor_policy.manage` gobiernan configuración e interpretación de reglas
laborales; no reemplazan permisos de lectura sensible, aprobación ni export.

Regla aprobada para I0:

- `labor_policy.review` autoriza consultar versiones, parámetros efectivos y metadata de policy
  laboral dentro del scope autorizado
- `labor_policy.manage` autoriza crear, versionar, activar o corregir configuración de policy
  laboral
- `labor_policy.review` no implica `time.read_sensitive`, `time.export` ni `time.adjust.approve`
- `labor_policy.manage` no implica `time.export`; una persona puede administrar la policy sin poder
  exportar jornadas/payroll
- `time.export` no implica `labor_policy.manage`; exportar payroll no autoriza modificar reglas
  laborales

Interpretación de `payroll` como assignment:

- `payroll` es un perfil/assignment esperado para actores de nómina, no un rol implícito
- un actor `payroll` normalmente combinará `time.read_sensitive`, `time.export` y, opcionalmente,
  `labor_policy.review`
- `payroll` no recibe por defecto `workshift.plan`, `workshift.assign` ni `labor_policy.manage`

Modelo de separación de funciones:

- planificación operativa de turnos → `workshift.plan`
- asignación/reasignación operativa → `workshift.assign`
- lectura laboral sensible interactiva → `time.read_sensitive`
- export payroll / compliance → `time.export` + step-up + audit
- revisión de reglas laborales y su versión efectiva → `labor_policy.review`
- cambio/versionado de reglas laborales → `labor_policy.manage`

No aprobado en I0:

- usar `labor_policy.review` como shortcut para leer time entries sensibles
- usar `labor_policy.manage` como shortcut para aprobar ajustes o exportar payroll
- usar el nombre del assignment `payroll` como autorización suficiente sin permisos explícitos
