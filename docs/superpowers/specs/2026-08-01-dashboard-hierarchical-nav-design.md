# Dashboard: navegación jerárquica en 2 pasos

## Problema

El dashboard (`apps/web`) es completamente plano: Marcas, Sucursales y Usuarios son
páginas separadas conectadas solo por dropdowns internos, sin jerarquía visual ni
contexto persistente más allá del tenant. El modelo de dominio real es
`Tenant → Marca → Sucursal → Salón` (`docs/foundation/06-domain-model.md`), pero
nada en la UI lo refleja.

## Objetivo

Dos pasos explícitos:

1. **Selección de Tenant** (raíz) — pantalla dedicada, no un dropdown escondido.
2. **Operación dentro del tenant activo** — árbol jerárquico `Marca → Sucursal →
(Salones, Empleados)` con panel de detalle a la derecha.

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
- Si `me.tenants.length === 1`: auto-selección y redirect a `/`, sin mostrar
  pantalla (comportamiento ya implícito en `tenant-context.tsx`, se preserva).
- Si `me.tenants.length > 1`: grilla de cards (nombre del tenant), click llama a
  `selectTenant(id)` y navega a `/`.
- `DashboardLayout`: si `!selectedTenantId`, `<Navigate to="/select-tenant" />`
  en vez del bloque informativo actual.

## Paso 2 — Árbol + panel de detalle

Layout de dos columnas dentro de `DashboardLayout`, reemplazando el `<Outlet />`
plano por un nuevo `OrgExplorer`:

- **Columna izquierda — árbol** (`org-tree.tsx`):
  - Nodo raíz fijo, no clickeable: nombre del tenant activo (solo contexto).
  - Hijos: Marcas (`/v1/brands`).
  - Hijos de cada Marca: Sucursales, filtradas por `brandId` desde `/v1/branches`
    (join en cliente).
  - Hijos de cada Sucursal (lazy, solo al expandir): "Salones" (`/v1/salons?
branchId=`) y "Empleados" (fetch de usuarios/asignaciones filtrado por esa
    sucursal).
  - Cada nodo clickeable setea `selectedNode` (tipo + id) en estado local del
    `OrgExplorer` (no en `tenant-context` — es navegación de UI, no contexto de
    sesión).
  - Botones "+" en cada nivel (Marca, Sucursal, Salón) abren el panel derecho en
    modo alta.

- **Columna derecha — panel de detalle** (`org-detail-panel.tsx`):
  - Despacha por `selectedNode.type`:
    `brand → BrandDetailPanel`, `branch → BranchDetailPanel`,
    `salon → SalonDetailPanel`, `branch-employees → BranchEmployeesPanel`.
  - Cada `*DetailPanel` recibe `id` (o `null` en modo alta) como prop y encapsula
    su propio fetch + mutación, extraídos de los componentes actuales:
    - `BrandDetailPanel` ← lógica de `features/brands/brands-page.tsx`.
    - `BranchDetailPanel` ← lógica de `features/branches/branches-page.tsx`
      (parte de sucursal).
    - `SalonDetailPanel` ← lógica de salones, hoy embebida en
      `branches-page.tsx`.
    - `BranchEmployeesPanel` ← `features/users/users-page.tsx`, con filtro por
      `branchId` agregado.
  - Sin nodo seleccionado: estado vacío ("elegí un nodo del árbol").

## Navegación global

- `NAV_ITEMS` en `dashboard-layout.tsx` pierde `/brands`, `/branches`, `/users`.
- Se agrega un único ítem "Organización" que apunta a `/` (el `OrgExplorer` pasa
  a ser la home del dashboard, reemplazando `overview-page` actual... **decisión
  explícita**: Overview se mantiene como página separada (`/overview`), no se
  fusiona; el `OrgExplorer` vive en `/organizacion`. Esto evita perder la vista
  de estado/checklist ya construida en `overview-page.tsx`).
- `setup-page.tsx` (`/setup`) no cambia — sigue siendo onboarding.

## Fuera de alcance (esta iteración)

- Drag & drop / mover sucursales entre marcas.
- Bulk actions sobre múltiples nodos.
- Cambios de API/backend — todo el trabajo es de composición en el cliente sobre
  endpoints existentes.

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
  `/select-tenant`; no existe un selector inline en el dashboard.
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
2. Una sesión con un único tenant no muestra el selector y entra directamente
   al dashboard.
3. El árbol muestra Tenant → Marca → Sucursal; salones y empleados no se
   solicitan hasta expandir la sucursal correspondiente.
4. Seleccionar marca, sucursal, salón o empleados abre el panel correcto; sin
   selección se muestra el estado vacío indicado por la spec.
5. Los botones `+` permiten crear marca, sucursal dentro de su marca y salón
   dentro de su sucursal, conservando el padre correcto.
6. Loading, empty, error con retry, validación y éxito de mutación son visibles
   y accesibles.
7. En mobile el árbol y el detalle se apilan, los controles mantienen targets
   de al menos 44 px y no se introducen violaciones WCAG A/AA serias o críticas.
