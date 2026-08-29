# Spec: contador exacto de salones en el árbol

## Decisión

El árbol debe cargar los salones de cada sucursal al renderizarla, no recién al expandir `Estructura física`. Mientras la consulta está pendiente mostrará `Cargando…`; luego mostrará el conteo real aunque el nodo continúe colapsado.

La etiqueta tendrá pluralización determinista: `0 salones`, `1 salón`, `N salones`. Los datos continúan obteniéndose con `useTenantQuery`, aislados por tenant y `branchId`.

## Unidades, branches y errores

- Etiqueta para cero, uno y múltiples salones.
- Loading previo a la respuesta.
- Error visible al expandir, con retry existente.
- El conteo no cambia por expandir/contraer si los datos no cambiaron.

## Playwright

Dash/Organización verificará el conteo correcto antes de expandir y la forma singular, además de mantener los gates responsive y de accesibilidad de la suite.
