# Plazas organizativas transversales

## Decisión de dominio

Una Plaza es una agrupación organizativa de mesas durante una Jornada. Orienta
la distribución del trabajo, pero no concede ni restringe permisos: un mozo puede
operar otras mesas cuando colabora, cubre una ausencia o recibe una indicación del
Maître.

- Una Plaza tiene como máximo un mozo responsable en una Jornada.
- Un empleo/mozo puede recibir cero, una o varias Plazas en la misma Jornada.
- `FIXED` identifica una composición habitual de mesas que se replica como
  snapshot en la siguiente Jornada de la sucursal.
- `VARIABLE` existe sólo para la Jornada en la que fue creada.
- El responsable nunca se copia automáticamente: la asignación laboral se decide
  por Jornada y puede cambiar sin alterar la composición fija.
- Cada instancia conserva nombre, mesas, modo y responsable históricos. Editar
  una Jornada nueva no modifica Jornadas cerradas.
- Una mesa no puede integrar dos Plazas dentro de la misma Jornada, aunque una
  Plaza sea fija y la otra variable.

## Contrato API

`Plaza` agrega `mode: FIXED | VARIABLE` y `sourcePlazaId?: UUID | null`.
Crear una Jornada replica las Plazas `FIXED` de la Jornada cronológicamente
anterior de la misma sucursal, conservando nombre, salón y mesas, dejando el
responsable sin asignar y enlazando `sourcePlazaId`.

`GET /v1/branches/:branchId/active-plazas` usa un permiso operativo de lectura y
devuelve la Jornada `OPEN`/`CLOSING`, sus Plazas, el código del responsable y
`isMine`, calculado mediante `Employment.personRef` y la identidad autenticada.
No filtra Plazas ni mesas por usuario.

Las mutaciones continúan requiriendo gestión de Jornada. La asignación de Plaza
no participa en RBAC de Visit, Occupancy, Order, Check o TableStatus.

## Experiencia por aplicación

### Dash

El editor de Plaza permite elegir `Fija` o `Variable`, explica la persistencia de
la composición y deja claro que un mozo puede recibir varias Plazas. El árbol
muestra el modo en cada nodo.

### Host / Maître

La vista operativa muestra la Jornada activa, todas sus Plazas, responsable y
cantidad de mesas. Esta información acompaña las decisiones de seating; no
oculta mesas sin Plaza ni bloquea acciones.

### Waiter / Mozo

El mapa prioriza `Mis Plazas`, admite múltiples grupos y mantiene `Otras Plazas`
y `Resto del salón` accesibles. Sin Jornada o sin asignación, el mozo conserva el
mapa normal y recibe un estado explicativo, no un error de autorización.

Kitchen, Cashier y Customer no cambian: trabajan con comandas/estaciones,
cuentas/visitas y disponibilidad física respectivamente.

## Estados y errores

- loading de contexto organizativo sin bloquear los estados de mesas;
- sin Jornada activa;
- Jornada sin Plazas;
- mozo sin Plaza asignada;
- una o varias Plazas propias;
- mesas sin Plaza;
- error de lectura con retry y degradación al mapa físico;
- conflicto al intentar repetir una mesa en dos Plazas de la Jornada;
- réplica fija rechazada si la composición ya no es válida, sin dejar una
  Jornada parcialmente creada.

## Verificación

- Unit tests al 100% de statements, branches, functions y lines sobre todo
  archivo nuevo o modificado.
- Playwright Dash: alta/edición fija y variable, badges, validación y marca.
- Playwright Floor: varias Plazas propias, otras Plazas, resto, sin Jornada, sin
  asignación, error/retry, mobile y accesibilidad.
- Playwright Host: snapshot de Jornada/Plazas, vacío, error/retry, responsive y
  accesibilidad.
- Journey: Dash crea Jornada y Plaza fija, asigna dos Plazas al mismo mozo; Floor
  las prioriza sin ocultar otra mesa y Host observa la organización.
