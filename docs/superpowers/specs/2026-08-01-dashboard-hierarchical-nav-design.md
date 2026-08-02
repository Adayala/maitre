# Dashboard: navegación jerárquica en 2 pasos

## Problema

El dashboard (`apps/web`) es completamente plano: Marcas, Sucursales y Usuarios son
páginas separadas conectadas solo por dropdowns internos, sin jerarquía visual ni
contexto persistente más allá del tenant. El modelo físico real es
`Tenant → Marca → Sucursal → Salón → Mesa` y la operación agrega
`Jornada de servicio → Plaza → Mesas asignadas` (`docs/foundation/05-domain-glossary.md`),
pero nada en la UI lo refleja.

## Objetivo

Dos pasos explícitos:

1. **Selección de Tenant** (raíz) — pantalla dedicada, no un dropdown escondido.
2. **Operación dentro del tenant activo** — árbol jerárquico `Marca → Sucursal →
(Salones → Plazas → Mesas, Empleados)` con panel de detalle a la derecha.

Una Plaza no es una mesa, una medida de capacidad ni un permiso. Es una
agrupación organizativa fija o variable de mesas de un mismo salón para una
jornada de servicio, normalmente asignada a un mozo. Un mozo puede recibir
varias Plazas y conserva acceso operativo al resto del salón. Los cubiertos son
la capacidad de cada mesa y se muestran como métrica, no como entidades CRUD.

## Estado actual reusable

- `apps/web/src/app/tenant-context.tsx`: ya persiste `selectedTenantId` en
  localStorage y expone `me.tenants` (con `branches` anidados) vía `/v1/me/context`.
  Se reusa tal cual.
- `apps/web/src/app/dashboard-layout.tsx`: ya bloquea el `Outlet` sin tenant
  seleccionado — pasa a redirigir a la nueva pantalla en vez de mostrar el bloque
  "Contexto pendiente".
- Endpoints existentes, sin cambios de API: `/v1/brands`, `/v1/branches`,
  `/v1/salons?branchId=`, `/v1/users` (o equivalente ya usado por `users-page.tsx`).
- `apps/web/src/lib/use-tenant-query.ts`: hook de fetch scopeado por tenant, se
  reusa en los paneles nuevos.

## Paso 1 — Selección de Tenant

- Ruta nueva `/select-tenant`.
- Si todavía no existe una selección válida, incluso con un único tenant, se
  muestra la pantalla para hacer explícito el perímetro de trabajo. Una selección
  persistida sólo se acepta si continúa presente en `/v1/me/context`; IDs obsoletos
  se descartan.
- La grilla de cards (nombre del tenant), al hacer click, llama a
  `selectTenant(id)` y navega a `/`.
- `DashboardLayout`: si `!selectedTenantId`, `<Navigate to="/select-tenant" />`
  en vez del bloque informativo actual.

## Paso 2 — Árbol + panel de detalle

Layout de dos columnas dentro de `OrgExplorer`, visible en el área central para
que la jerarquía no quede comprimida dentro del rail global:

- **Columna izquierda — árbol** (`org-tree.tsx`):
  - Nodo raíz fijo, no clickeable: nombre del tenant activo (solo contexto).
  - Hijos: Marcas (`/v1/brands`).
  - Hijos de cada Marca: Sucursales, filtradas por `brandId` desde `/v1/branches`
    (join en cliente).
  - Hijos visibles de cada Sucursal: grupos "Salones" (`/v1/salons?branchId=`) y
    "Equipo / mozos". Los registros se cargan lazy al expandir cada grupo y cada
    salón o relación laboral aparece como nodo individual editable.
  - Cada salón puede expandir sus plazas. Cada plaza declara jornada, modo fijo o
    variable, mesas y mozo asignado; sus mesas muestran capacidad en cubiertos. Una misma mesa no puede
    pertenecer a dos plazas de la misma jornada.
  - Cada nodo clickeable setea `selectedNode` (tipo + id) en estado local del
    `OrgExplorer` (no en `tenant-context` — es navegación de UI, no contexto de
    sesión).
  - Botones "+" en cada nivel (Marca, Sucursal, Salón y Equipo) abren el panel
    derecho en modo alta.

- **Columna derecha — panel de detalle** (`org-detail-panel.tsx`):
  - Despacha por `selectedNode.type`:
    `brand → BrandDetailPanel`, `branch → BranchDetailPanel`,
    `salon → SalonDetailPanel`, `plaza → PlazaDetailPanel`,
    `table → TableDetailPanel`, `branch-employees → BranchEmployeesPanel`,
    `employee → EmployeeDetailPanel`.
  - Cada `*DetailPanel` recibe `id` (o `null` en modo alta) como prop y encapsula
    su propio fetch + mutación, extraídos de los componentes actuales:
    - `BrandDetailPanel` ← lógica de `features/brands/brands-page.tsx`.
    - `BranchDetailPanel` ← lógica de `features/branches/branches-page.tsx`
      (parte de sucursal).
    - `SalonDetailPanel` ← lógica de salones, hoy embebida en
      `branches-page.tsx`.
    - `PlazaDetailPanel` crea/edita una plaza por jornada, define modo fijo o
      variable, limita las mesas al salón padre y permite elegir un empleo/mozo
      elegible para la sucursal. Si
      todavía no existe una jornada editable, permite crear la primera dentro
      del mismo flujo.
    - `TableDetailPanel` crea/edita número, nombre y capacidad en cubiertos usando
      `/v1/tables` y `/v1/tables/:id`.
    - `BranchEmployeesPanel` ← `features/users/users-page.tsx`, con filtro por
      `branchId` agregado.
    - `EmployeeDetailPanel` edita perfil y acceso vía `/v1/users/:id`, además de
      código, relación y estado laboral vía `PATCH /v1/employments/:id`.
    - `BrandDetailPanel` conserva el editor de identidad visual existente, no sólo
      nombre y estado.
  - Sin nodo seleccionado: estado vacío ("elegí un nodo del árbol").

## Navegación global

- `NAV_ITEMS` en `dashboard-layout.tsx` pierde `/brands`, `/branches`, `/users`.
- Se agrega un único ítem "Organización" que apunta a `/` (el `OrgExplorer` pasa
  a ser la home del dashboard, reemplazando `overview-page` actual... **decisión
  explícita**: Overview se mantiene como página separada (`/overview`), no se
  fusiona; el `OrgExplorer` vive en `/organizacion`. Esto evita perder la vista
  de estado/checklist ya construida en `overview-page.tsx`).
- `setup-page.tsx` (`/setup`) no cambia — sigue siendo onboarding.

## Presentación moderna y marca blanca

- Sin una marca elegida el Dash usa el tema moderno de plataforma: sans
  contemporánea, canvas frío claro, superficies blancas, bordes suaves, radios
  medianos, profundidad contenida y un único acento índigo.
- La base visual evita la escala editorial anterior: los títulos operativos no
  superan 58 px en desktop, el rail es una superficie clara y la jerarquía se
  expresa con peso, espacio y tintes en vez de bloques negros o reglas gruesas.
- El theme de una marca no se aplica por ser la primera marca devuelta por la API.
  Se aplica únicamente cuando el usuario elige explícitamente esa marca o un nodo
  descendiente suyo y queda persistido por tenant.
- El documento de presentación publicado reemplaza fonts, colores, assets, radio
  y elevación; los tokens ausentes heredan el tema moderno de plataforma.
- Cambiar tenant descarta cualquier marca seleccionada de otro tenant. No hay
  fugas visuales ni de datos entre tenants.
- El header identifica si la apariencia activa es la base Maitre o una marca y,
  cuando hay una marca elegida, permite restaurar explícitamente el tema base.
- El rail global puede contraerse a una barra compacta de 84 px. En ese estado
  conserva todos los destinos mediante siglas accesibles, muestra tooltips,
  expone un control con `aria-expanded` y persiste la preferencia en el browser.
  En mobile prevalece la navegación completa para no convertir los destinos en
  controles crípticos.
- La jerarquía tipográfica separa tres funciones: la fuente heading de la marca
  se reserva para títulos de contenido; navegación, header, botones y metadata
  usan la fuente body/UI; texto extenso usa body con una escala mínima legible.
  Sin marca, la pila moderna prioriza Inter/Avenir y fallbacks sans del sistema.

## Fuera de alcance (esta iteración)

- Drag & drop / mover sucursales entre marcas.
- Bulk actions sobre múltiples nodos.
- Mover relaciones laborales entre sucursales desde el árbol. La API permite
  editar sus atributos, pero el panel mantiene fija la sucursal padre.

## Riesgos / notas de implementación

- El árbol arma la jerarquía uniendo 2-3 requests en el cliente (`brands` +
  `branches` + lazy `salons`/`employees` por sucursal expandida). No hay un
  endpoint `/v1/org-tree` — se acepta el costo de varios requests pequeños en vez
  de tocar backend.
- Extraer los `*DetailPanel` de las páginas actuales es un refactor mecánico
  (mover el JSX + hooks de fetch/mutation existentes a un componente con props
  en vez de con `useState` de selección propio) — no se reescribe lógica de
  negocio ni validaciones.

## Contratos y decisiones cerradas durante la implementación

- El árbol separa dos dimensiones que no deben confundirse: `Estructura física
→ Salones → Mesas` y `Operación de servicio → Jornadas → Plazas`. Una Plaza
  se muestra bajo su Jornada y sólo referencia mesas de un único Salón; las mesas
  nunca pasan a ser hijas físicas de la Plaza.
- Jornada de servicio es un nodo navegable. Desde su panel se crea la ejecución
  concreta y se gestiona su ciclo `PLANNED → OPEN → CLOSING → CLOSED` o su
  cancelación. El alta de Plaza nace dentro de una Jornada editable y luego exige
  elegir Salón, al menos una Mesa y opcionalmente un mozo/responsable.
- Una Plaza fija replica nombre, salón y mesas como snapshot al crear la Jornada
  siguiente de la sucursal; no replica responsable. Una Plaza variable no se
  propaga. La asignación es organizativa y un mozo puede aparecer en varias
  Plazas de la Jornada.
- Los tres grupos de una Sucursal son visibles aun cerrados: “Estructura física”,
  “Operación de servicio” y “Equipo”. Al expandir Operación se muestran a la vez
  cada Jornada y su grupo “Plazas”, incluido el estado vacío accionable; Plaza no
  queda escondida detrás de la expansión previa de un Salón.
- `PlantillaServicio` continúa fuera de esta iteración: figura en el modelo
  conceptual pero sus specs de entidad y API siguen pendientes en
  `docs/sdd/INDEX.md`. La UI no presenta un CRUD ficticio sin contrato persistente.

- El rail global conserva un único acceso a Organización y los grupos “Control
  operativo” y “Gobierno”. El árbol editable vive dentro de `/organizacion`, en
  una columna amplia junto al panel de detalle; así no compite con la navegación
  global ni oculta formularios en un rail angosto.
- La selección de un nodo se representa en la URL de `/organizacion` para que el
  panel derecho sobreviva refresh, deep link y navegación desde cualquier
  sección del dashboard.
- El proyecto productivo canónico del Dash es `maitre-dash.vercel.app`; el
  pipeline no debe desplegar la aplicación en un proyecto alternativo.
- El health check post-deploy del API usa el alias público canónico
  `maitre-api.vercel.app`; las URLs inmutables protegidas por Vercel SSO no son
  una señal válida de salud pública.
- `/` es un redirect de compatibilidad a `/organizacion`; Overview queda en
  `/overview` y Setup en `/setup`.
- Las rutas legacy `/brands`, `/branches`, `/users` y `/profiles` redirigen a
  `/organizacion` para no dejar deep links sin destino, pero ya no aparecen en
  la navegación global.
- La carga lazy de empleados usa el endpoint existente
  `/v1/branches/:branchId/employments`. El panel cruza `personRef` con
  `/v1/users` cuando existe una identidad vinculable y usa `/v1/roles` para los
  nombres visibles. No se infiere una asignación desde una membership global.
- Cambiar tenant vuelve a ser una acción explícita desde el header y abre
  `/select-tenant`; el header dice “Trabajando en …” y no existe un selector
  ambiguo inline en el dashboard.
- El alta desde “Empleados” crea primero la invitación (`/v1/users`) y luego la
  relación laboral scopeada a la sucursal (`/v1/employments`). Si falla el
  segundo paso, el reintento conserva el usuario creado y no duplica la
  invitación.
- El journey de release usa `/overview` para el resumen operativo y
  `/organizacion` para las altas jerárquicas; no depende de las rutas legacy.

## Criterios de aceptación verificables

1. Una sesión sin tenant seleccionado y con más de un tenant llega a
   `/select-tenant`, puede elegir una card y persiste el ID antes de entrar a
   `/organizacion`.
2. Una sesión sin selección explícita y con un único tenant también muestra su
   card; una selección persistida válida entra directamente y una obsoleta vuelve
   al selector.
3. El árbol muestra Tenant → Marca → Sucursal y separa Estructura física,
   Operación de servicio y Equipo; los recursos se solicitan al expandir el grupo
   correspondiente.
4. Seleccionar marca, sucursal, salón, equipo o persona abre el panel correcto;
   sin selección se muestra el estado vacío indicado por la spec.
5. Los botones `+` permiten crear marca, sucursal dentro de su marca, salón
   dentro de su sucursal y una persona asignada al equipo correcto.
6. Loading, empty, error con retry, validación y éxito de mutación son visibles
   y accesibles.
7. En mobile el árbol y el detalle se apilan, los controles mantienen targets
   de al menos 44 px y no se introducen violaciones WCAG A/AA serias o críticas.
8. Marca, sucursal, salón y persona/mozo pueden editarse desde el mismo árbol;
   la persona conserva edición de perfil, acceso y relación laboral.
9. Un salón muestra sus mesas físicas. Una Jornada muestra sus Plazas; una Plaza
   puede editar nombre, mozo y mesas mientras la Jornada sea editable, y cada
   mesa muestra/edita su capacidad en cubiertos.
10. La Jornada puede crearse desde Operación, muestra tipo, fecha y estado, y
    permite las transiciones válidas de apertura, cierre o cancelación.
11. Sin marca elegida se renderiza el tema moderno de plataforma. Elegir Marca A
    aplica sólo su presentación publicada; cambiar a Marca B o de tenant reemplaza
    los tokens sin conservar valores de la marca anterior.
12. El usuario ve en el header qué apariencia está activa y puede volver al tema
    base; el Dash base no usa serif ni títulos editoriales sobredimensionados.
13. El editor distingue Plaza fija y variable; una nueva Jornada replica sólo
    las composiciones fijas y permite asignar varias al mismo mozo sin convertir
    esa relación en un alcance de autorización.
14. El usuario puede contraer y expandir el panel vertical, navegar a todos sus
    destinos en ambos estados y conservar la preferencia después de recargar.
15. Títulos, navegación y cuerpo mantienen una escala descendente verificable;
    seleccionar una marca reemplaza heading y body sin reintroducir serif ni
    desordenar tamaños o pesos.
