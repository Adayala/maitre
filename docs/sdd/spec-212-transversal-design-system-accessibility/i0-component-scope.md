# Alcance de componentes I0 — SPEC-212

El inventario sirve únicamente al recorrido login → contexto → Dash de SPEC-213.

## Tokens requeridos

- superficies: canvas, panel y elevated;
- texto: primary, secondary, disabled e inverse;
- bordes: default, strong y focus;
- acciones: primary/secondary/destructive con estados interactivos;
- feedback: info, success, warning y danger, cada uno con foreground/background/border;
- tipografía: body, label, heading y code;
- spacing, radius, shadow, motion y layer scales;
- focus ring y target mínimo 44×44 CSS px.

Cada combinación de foreground/background usada posee prueba de contraste. Los nombres son semánticos; valores de marca finales permanecen fuera de I0.

## Primitivas I0

| Componente | Consumidor | Estados mínimos |
| --- | --- | --- |
| `Button` | login, selector, logout | default, hover, active, focus, disabled, loading |
| `TextField` | login | default, focus, invalid, disabled, ayuda/error |
| `Link` | recuperación/skip link | default, visited cuando aplique, focus |
| `Alert` | auth/API/session | info, warning, danger; título opcional |
| `LoadingIndicator` | sesión/contexto | label accesible, reduced motion |
| `EmptyState` | sin memberships | título, explicación, acción opcional |
| `ConnectivityStatus` | shell | online, offline, reconnecting, degraded |

El selector de contexto comienza con HTML nativo (`fieldset`/radio o `select`, según cantidad y contenido). No se crea un Select custom ni Dialog en I0 sin evidencia de necesidad.

## Patrones I0

- `AuthScreen`: heading único, formulario, error no enumerativo y recuperación.
- `ContextPicker`: memberships/branches permitidas, estado vacío y selección por teclado.
- `DashShell`: skip link, header, main landmark, contexto activo, conectividad y logout.
- `AsyncBoundary`: loading, error recuperable, offline y sesión expirada sin flash autorizado.

Los patrones viven inicialmente cerca de `apps/web`. Sólo primitivas y tokens ingresan a packages compartidos. Una segunda reutilización real puede justificar promoción posterior.

## Matriz de viewports I0

| Perfil | Verificación |
| --- | --- |
| 320 CSS px / zoom 200 % | reflow sin pérdida de acción |
| teléfono touch | targets, teclado virtual y errores visibles |
| tablet | selector y shell sin espacios/controles desproporcionados |
| desktop | orden de tab, ancho legible y foco persistente |

## Evidencia requerida

- tests Testing Library por comportamiento;
- axe-core sin violaciones conocidas;
- recorrido Playwright sólo teclado;
- revisión manual de contraste, zoom/reflow y lector de pantalla;
- baseline/delta de bundle;
- screenshots estables de login, contexto, vacío, error y Dash.
