# Spec: sincronización entre árbol y panel de Organización

## Contexto

GitHub #102 describe que el árbol puede navegarse hacia una sucursal mientras el panel conserva un salón previamente seleccionado en otra rama. Como el panel mantiene habilitadas acciones de escritura, la discrepancia puede causar una modificación sobre una entidad distinta de la que el usuario percibe como activa.

La selección durable vive en la URL de `/organizacion`. Expandir un grupo del árbol actualmente cambia sólo estado local y no actualiza esa selección.

## Decisión

Toda interacción que expanda un grupo de dominio de una sucursal seleccionará primero esa sucursal en la URL y en el panel. Contraer un grupo no cambiará la selección. Los botones de entidades concretas seguirán seleccionando la entidad correspondiente.

Así, al comenzar a explorar una rama, el panel pasa inmediatamente al detalle de su sucursal y deja de exponer acciones pertenecientes a un salón, mesa, jornada, plaza o empleado seleccionado en otra rama.

## Límites de tenant y autorización

- La sucursal seleccionada se obtiene exclusivamente de `branches` cargadas mediante `useTenantQuery` para el tenant activo.
- La navegación conserva el `brandId` de la sucursal y actualiza la selección de marca dentro del namespace del tenant activo.
- No se incorporan datos globales, nombres o identificadores hardcodeados.
- El cambio no amplía permisos: el panel continúa usando las consultas y mutaciones autorizadas existentes.

## Unidades, branches y errores a probar

- Resolver la selección para una interacción de expansión.
- Expansión desde selección nula: seleccionar la sucursal.
- Expansión desde la misma sucursal: conservar una selección equivalente.
- Expansión desde un descendiente de otra sucursal: seleccionar la nueva sucursal.
- Contracción: no forzar navegación ni reemplazar la selección.
- Error de carga lazy: el panel debe permanecer en la sucursal seleccionada y el retry no debe restaurar una entidad obsoleta.

## Playwright

Suite dueña: `tests/e2e/apps/dash/hierarchical-navigation.spec.ts`.

Fixture determinista: dos marcas y dos sucursales del mismo tenant, con un salón seleccionable en la primera rama. El recorrido selecciona ese salón, expande la estructura física de la segunda sucursal y verifica:

- URL branch-scoped de la segunda sucursal;
- encabezado y campos del panel correspondientes a esa sucursal;
- ausencia de acciones del salón anterior;
- navegación persistente después de reload;
- funcionamiento en el viewport responsive definido por Dash;
- ausencia de violaciones serias o críticas mediante el gate de accesibilidad de la suite.

## Criterios de aceptación

- `selection-sync`: expandir una rama actualiza el panel a su sucursal; contraer no introduce selecciones inesperadas.
- `unsafe-actions`: después del cambio de rama no quedan visibles ni ejecutables acciones del detalle anterior.
- `tenant-safety`: toda resolución usa datos del tenant y marca activos.
- `tests`: el código nuevo o modificado alcanza 100% de statements, branches, functions y lines.
- `e2e`: el recorrido Dash verifica navegación, persistencia, permisos y estados relevantes.

## Fuera de alcance

- Rediseñar el árbol o agregar breadcrumbs; corresponde a GitHub #105.
- Cambiar el contador lazy de salones; corresponde a GitHub #104.
- Modificar contratos de API.
